﻿using System;
using SocketProAdapter;
using SocketProAdapter.ServerSide;
using SocketProAdapter.ClientSide;

#if USE_SQLITE
using CMaster = SocketProAdapter.CSqlMasterPool<SocketProAdapter.ClientSide.CSqlite, SocketProAdapter.CDataSet>;
#else
using CMaster = SocketProAdapter.CSqlMasterPool<SocketProAdapter.ClientSide.CMysql, SocketProAdapter.CDataSet>;
#endif

class CYourServer : CSocketProServer
{
    public static CMaster Master;
    public static CMaster.CSlavePool Slave;

    [ServiceAttr(ss.Consts.sidStreamSystem)]
    private CSocketProService<CYourPeerOne> m_SSPeer = new CSocketProService<CYourPeerOne>();

    public CYourServer(int param = 1)
        : base(param)
    {

    }

    protected override bool OnSettingServer()
    {
        //amIntegrated and amMixed not supported yet
        Config.AuthenticationMethod = tagAuthenticationMethod.amOwn;
        SetChatGroups();
        return true;
    }

    protected override bool OnIsPermitted(ulong hSocket, string userId, string password, uint nSvsID)
    {
        Console.WriteLine("Ask for a service {0} from user {1} with password = {2}", nSvsID, userId, password);
        return true;
    }

    void SetChatGroups()
    {
        PushManager.AddAChatGroup(CAsyncDBHandler.STREAMING_SQL_CHAT_GROUP_ID, "Subscribe/publish for front clients");
        PushManager.AddAChatGroup(CAsyncDBHandler.CACHE_UPDATE_CHAT_GROUP_ID, "Cache update notification from middle tier to front");
    }

    public static void CreateTestDB()
    {
#if USE_SQLITE
        var handler = Master.Seek();
        if (handler != null)
        {
            bool ok = handler.Execute("ATTACH DATABASE 'mysample.db' as mysample", null);
            string sql = "CREATE TABLE mysample.COMPANY(ID INT8 PRIMARY KEY NOT NULL,Name CHAR(64)NOT NULL);CREATE TABLE mysample.EMPLOYEE(EMPLOYEEID INTEGER PRIMARY KEY AUTOINCREMENT,CompanyId INT8 not null,Name NCHAR(64)NOT NULL,JoinDate DATETIME not null default(datetime('now')),FOREIGN KEY(CompanyId)REFERENCES COMPANY(id))";
            ok = handler.Execute(sql);
            sql = "INSERT INTO mysample.COMPANY(ID,Name)VALUES(1,'Google Inc.'),(2,'Microsoft Inc.'),(3,'Amazon Inc.')";
            ok = handler.Execute(sql);
        }
#else
        string sql = "CREATE DATABASE IF NOT EXISTS mysample character set utf8 collate utf8_general_ci;USE mysample;CREATE TABLE IF NOT EXISTS COMPANY(ID BIGINT PRIMARY KEY NOT NULL,Name CHAR(64)NOT NULL);CREATE TABLE IF NOT EXISTS EMPLOYEE(EMPLOYEEID BIGINT PRIMARY KEY AUTO_INCREMENT,CompanyId BIGINT NOT NULL,Name NCHAR(64)NOT NULL,JoinDate DATETIME(6)DEFAULT NULL,FOREIGN KEY(CompanyId)REFERENCES COMPANY(id));USE sakila";
        var handler = Master.Seek();
        if (handler != null)
        {
            bool ok = handler.Execute(sql);
            sql = "INSERT INTO mysample.COMPANY(ID,Name)VALUES(1,'Google Inc.'),(2,'Microsoft Inc.'),(3,'Amazon Inc.')";
            ok = handler.Execute(sql);
        }
#endif
    }

    public static void StartMySQLPools()
    {
        CConfig config = CConfig.GetConfig();

        //These case-sensitivities depends on your DB running platform and sensitivity settings.
        //All of them are false or case-insensitive by default
        CMaster.Cache.FieldNameCaseSensitive = false;
        CMaster.Cache.TableNameCaseSensitive = false;
        CMaster.Cache.DBNameCaseSensitive = false;

        CYourServer.Master = new CMaster(config.m_master_default_db, true);
        //start master pool for cache and update accessing
        bool ok = CYourServer.Master.StartSocketPool(config.m_ccMaster, config.m_nMasterSessions, 1); //one thread enough
        
        //compute threads and sockets_per_thread
        uint threads = config.m_nSlaveSessions / (uint)config.m_vccSlave.Count;
        uint sockets_per_thread = (uint)config.m_vccSlave.Count;

        CYourServer.Slave = new CMaster.CSlavePool(config.m_slave_default_db);

        CConnectionContext[,] ppCC = new CConnectionContext[threads, sockets_per_thread];
        for (uint i = 0; i < threads; ++i)
        {
            for (uint j = 0; j < sockets_per_thread; ++j)
            {
                ppCC[i, j] = config.m_vccSlave[(int)j];
            }
        }
        //start slave pool for query accessing
        ok = CYourServer.Slave.StartSocketPool(ppCC);

        //wait until all data of cached tables are brought from backend database server to this middle server application cache
        ok = CYourServer.Master.AsyncHandlers[0].WaitAll();
    }
}
