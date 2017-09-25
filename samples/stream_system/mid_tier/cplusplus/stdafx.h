
#pragma once

#include "../../../../include/mysql/umysql.h"
#include "../../../../include/aserverw.h"
#include "../../../../include/udb_client.h"
#include "../../shared/ss_defines.h"

using namespace SPA::ClientSide;
using namespace SPA::ServerSide;
using namespace SPA::UDB;

typedef SPA::ClientSide::CAsyncDBHandler<SPA::Mysql::sidMysql> CMySQLHandler;
typedef SPA::ClientSide::CSocketPool<CMySQLHandler> CMySQLPool;


#ifdef WIN32_64

#include "targetver.h"
#include <stdio.h>

#else

#endif

#include <iostream>
