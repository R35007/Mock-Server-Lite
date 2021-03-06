
import chalk from 'chalk';
import * as fs from 'fs';
import JPH from 'json-parse-helpfulerror';
import * as _ from 'lodash';
import * as path from 'path';
import { PathDetails } from '../types/common.types';

export const requireFile = (directoryPath: string, excludeFolders: string[] = [], recursive: boolean = true, isList: boolean = false) => {
  const filesList = getFilesList(directoryPath, excludeFolders, recursive);
  const files = filesList.filter((f) => [".json", ".jsonc", ".har", ".js"].includes(f.extension));

  if (!files.length) return;

  if (files.length > 1)
    return isList ? getList(files) : getObject(files)


  const file = files[0];
  try {
    if (path.extname(file.filePath) === ".js") {
      delete require.cache[require.resolve(file.filePath)];
      return require(file.filePath);
    } else {
      const str = fs.readFileSync(file.filePath, "utf-8");
      return JPH.parse(str)
    }
  } catch (error) {
    console.log(chalk.red(`Error reading ${file.filePath}`));
    console.log(error);
    return;
  }
};

export const getObject = (files: PathDetails[]): object => {
  const obj = files.reduce((mock, file) => {
    try {
      if (path.extname(file.filePath) === ".js") {
        delete require.cache[require.resolve(file.filePath)];
        const obj = require(file.filePath);
        if (_.isEmpty(obj) || !_.isPlainObject(obj)) return mock
        return { ...mock, ...obj };
      } else {
        const str = fs.readFileSync(file.filePath, "utf-8");
        if (_.isEmpty(str) || !_.isPlainObject(JPH.parse(str))) return mock
        return { ...mock, ...JPH.parse(str) };
      }
    } catch (error) {
      console.log(chalk.red(`Error reading ${file.filePath}`));
      console.log(error);
      return mock;
    }
  }, {});
  return obj;
};

export const getList = (files: PathDetails[]): any[] => {
  const list = files.reduce((mock, file) => {
    try {
      if (path.extname(file.filePath) === ".js") {
        delete require.cache[require.resolve(file.filePath)];
        const obj = require(file.filePath);
        if (_.isEmpty(obj) || !_.isArray(obj)) return mock
        return [...mock, ...obj];
      } else {
        const str = fs.readFileSync(file.filePath, "utf-8");
        if (_.isEmpty(str) || !_.isArray(JPH.parse(str))) return mock
        return [...mock, ...JPH.parse(str)];
      }
    } catch (error) {
      console.log(chalk.red(`Error reading ${file.filePath}`));
      console.log(error);
      return mock;
    }
  }, [] as any[]);
  return list;
};

export const getFilesList = (directoryPath: string, foldersToExclude: string[] = [], recursive: boolean = true): PathDetails[] => {
  const stats = getStats(directoryPath);
  if (!stats) return [];
  if (stats.isFile) {
    return [stats];
  } else if (stats.isDirectory && foldersToExclude.indexOf(directoryPath) < 0) {
    const files = fs.readdirSync(directoryPath);
    const filteredFiles = files.filter((file) => foldersToExclude.indexOf(file) < 0);
    const filesList = filteredFiles.reduce((res: PathDetails[], file: string) => {
      if (recursive) {
        return res.concat(getFilesList(`${directoryPath}/${file}`, foldersToExclude, true));
      }
      return res.concat(getStats(`${directoryPath}/${file}`) || []);
    }, []);

    return filesList;
  }
  return [];
};

export const getStats = (directoryPath: string): PathDetails | undefined => {
  if (!fs.existsSync(directoryPath)) return;
  const stats = fs.statSync(directoryPath);
  const extension = path.extname(directoryPath);
  const fileName = path.basename(directoryPath, extension);
  return { fileName, extension, filePath: directoryPath, isFile: stats.isFile(), isDirectory: stats.isDirectory() };
};


export const parseUrl = (relativeUrl?: string, root: string = process.cwd()): string => {
  if (!relativeUrl || typeof relativeUrl !== 'string' || !relativeUrl?.trim().length) return '';
  if (relativeUrl.startsWith("http")) return relativeUrl;
  const parsedUrl = decodeURIComponent(path.resolve(root, relativeUrl));
  return parsedUrl;
};

export const requireData = (data?: any, root: string = process.cwd(), isList: boolean = false) => {
  if (_.isEmpty(data)) return;
  if (_.isString(data)) return requireFile(parseUrl(data, root), [], true, isList)
  if (_.isPlainObject(data) || _.isArray(data)) return _.cloneDeep(data)
  return;
}