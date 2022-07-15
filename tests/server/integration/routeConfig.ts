import path from "path";
import request from 'supertest';
import { MockServer } from '../../../src/server';


export const routeConfig = () => {
  describe('Testing all Route Configs', () => {
    let mockServer: MockServer;
    beforeEach(() => { mockServer = MockServer.Create({ root: path.join(__dirname, "../../../") }) });
    afterEach(async () => { await MockServer.Destroy() });

    it('should get string response', async () => {
      const mock = "Working !"
      const db = { "/Hi": mock }
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/Hi");
      expect(response.text).toBe(mock);
      expect(response.statusCode).toBe(200)
      expect(response.type).toBe("text/html");
    });

    it('should get string response if a mock is a number', async () => {
      const db = { "/Hi": 1234 }
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/Hi");
      expect(response.text).toBe("1234");
      expect(typeof response.text).toBe("string");
      expect(response.statusCode).toBe(200)
      expect(response.type).toBe("text/html");
    });

    it('should get json object response', async () => {
      const mock = { id: "1", name: "Siva" };
      const db = { "/user": mock };
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/user");
      expect(response.body).toEqual(mock);
      expect(response.statusCode).toBe(200);
      expect(response.type).toEqual('application/json');
    });

    it('should get list response', async () => {
      const mock = [{ id: "1", name: "Siva" }];
      const db = { "/users": mock };
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/users");
      expect(response.body).toEqual(mock);
      expect(response.statusCode).toBe(200);
      expect(response.type).toEqual('application/json');
    });

    it('should get response with delay 2s', async () => {
      const mock = { id: "1", name: "Siva" };
      const db = { "/user": { _config: true, delay: 2000, mock } };
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/user");
      const responseTime = parseInt(response.header["x-response-time"]);
      expect(responseTime).toBeGreaterThan(2000);
    });

    it('should get response with statusCode 500', async () => {
      const mock = { id: "1", name: "Siva" };
      const db = { "/user": { _config: true, statusCode: 500, mock } };
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/user");
      expect(response.statusCode).toBe(500);
    });

    it('should run the given middleware name', async () => {
      const mock = { id: "1", name: "Siva" };
      const db = { "/user": { _config: true, middlewares: ["getUser"] } };
      const middlewares = { "getUser": (_req, res) => { res.send(mock) } }
      await mockServer.launchServer(db, [], middlewares);
      const response = await request(mockServer.app).get("/user");
      expect(response.body).toEqual(mock);
      expect(response.statusCode).toEqual(200);
    });

    it('should run the given middleware', async () => {
      const mock = { id: "1", name: "Siva" };
      const db = { "/user": { _config: true, middlewares: [(_req, res) => { res.send(mock) }] } };
      await mockServer.launchServer(db);
      const response = await request(mockServer.app).get("/user");
      expect(response.body).toEqual(mock);
      expect(response.statusCode).toEqual(200);
    });
  });
}