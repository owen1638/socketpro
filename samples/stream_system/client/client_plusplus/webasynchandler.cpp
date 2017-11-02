
#include "stdafx.h"
#include "webasynchandler.h"

SPA::CUCriticalSection CWebAsyncHandler::m_csSS;
SPA::UINT64 CWebAsyncHandler::m_ssIndex = 0;

CWebAsyncHandler::CWebAsyncHandler(CClientSocket *pClientSocket)
	: CCachedBaseHandler<sidStreamSystem>(pClientSocket) {
}

SPA::UINT64 CWebAsyncHandler::QueryPaymentMaxMinAvgs(const wchar_t *filter, DMaxMinAvg mma, DMyCanceled canceled) {
	ResultHandler arh = [this](CAsyncResult & ar) {
		SPA::UINT64 index;
		int res;
		std::wstring errMsg;
		CMaxMinAvg m_m_a;
		ar >> index >> res >> errMsg >> m_m_a;
		std::pair<DMaxMinAvg, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapMMA[index];
			this->m_mapMMA.erase(index);
		}
		if (p.first)
			p.first(index, m_m_a, res, errMsg);
	};
	m_csSS.lock();
	SPA::UINT64 index = ++m_ssIndex;
	m_csSS.unlock();
	{
		SPA::CAutoLock al(this->m_csCache);
		m_mapMMA[index] = std::pair<DMaxMinAvg, DMyCanceled>(mma, canceled);
	}
	if (!SendRequest(idQueryMaxMinAvgs, index, filter, arh, [index, this]() {
		std::pair<DMaxMinAvg, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapMMA[index];
			this->m_mapMMA.erase(index);
		}
		if (p.second)
			p.second(index);
	})) {
		SPA::CAutoLock al(this->m_csCache);
		m_mapMMA.erase(index);
		return 0;
	}
	return index;
}

SPA::UINT64 CWebAsyncHandler::GetRentalDateTimes(SPA::INT64 rentalId, DRentalDateTimes rdt, DMyCanceled canceled) {
	ResultHandler arh = [this](CAsyncResult & ar) {
		SPA::UINT64 index;
		int res;
		std::wstring errMsg;
		CRentalDateTimes rdt;
		ar >> index >> rdt >> res >> errMsg;
		std::pair<DRentalDateTimes, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapRentalDateTimes[index];
			this->m_mapRentalDateTimes.erase(index);
		}
		if (p.first)
			p.first(index, rdt, res, errMsg);
	};
	m_csSS.lock();
	SPA::UINT64 index = ++m_ssIndex;
	m_csSS.unlock();
	{
		SPA::CAutoLock al(this->m_csCache);
		m_mapRentalDateTimes[index] = std::pair<DRentalDateTimes, DMyCanceled>(rdt, canceled);
	}
	if (!SendRequest(idGetRentalDateTimes, index, rentalId, arh, [index, this]() {
		std::pair<DRentalDateTimes, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapRentalDateTimes[index];
			this->m_mapRentalDateTimes.erase(index);
		}
		if (p.second)
			p.second(index);
	})) {
		SPA::CAutoLock al(this->m_csCache);
		m_mapRentalDateTimes.erase(index);
		return 0;
	}
	return index;
}

SPA::UINT64 CWebAsyncHandler::GetMasterSlaveConnectedSessions(DConnectedSessions cs, DMyCanceled canceled) {
	ResultHandler arh = [this](CAsyncResult & ar) {
		SPA::UINT64 index;
		unsigned int master_connections, slave_conenctions;
		ar >> index >> master_connections >> slave_conenctions;
		std::pair<DConnectedSessions, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapSession[index];
			this->m_mapSession.erase(index);
		}
		if (p.first)
			p.first(index, master_connections, slave_conenctions);
	};
	m_csSS.lock();
	SPA::UINT64 index = ++m_ssIndex;
	m_csSS.unlock();
	{
		SPA::CAutoLock al(this->m_csCache);
		m_mapSession[index] = std::pair<DConnectedSessions, DMyCanceled>(cs, canceled);
	}
	if (!SendRequest(idGetMasterSlaveConnectedSessions, index, arh, [index, this]() {
		std::pair<DConnectedSessions, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapSession[index];
			this->m_mapSession.erase(index);
		}
		if (p.second)
			p.second(index);
	})) {
		SPA::CAutoLock al(this->m_csCache);
		m_mapSession.erase(index);
		return 0;
	}
	return index;
}

SPA::UINT64 CWebAsyncHandler::UploadEmployees(const SPA::UDB::CDBVariantArray &vData, DUploadEmployees res, DMyCanceled canceled) {
	ResultHandler arh = [this](CAsyncResult & ar) {
		SPA::UINT64 index;
		int errCode;
		std::wstring errMsg;
		CInt64Array vId;
		ar >> index >> errCode >> errMsg >> vId;
		std::pair<DUploadEmployees, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapUpload[index];
			this->m_mapUpload.erase(index);
		}
		if (p.first)
			p.first(index, errCode, errMsg, vId);
	};
	m_csSS.lock();
	SPA::UINT64 index = ++m_ssIndex;
	m_csSS.unlock();
	{
		SPA::CAutoLock al(this->m_csCache);
		m_mapUpload[index] = std::pair<DUploadEmployees, DMyCanceled>(res, canceled);
	}
	if (!SendRequest(idUploadEmployees, index, vData, arh, [index, this]() {
		std::pair<DUploadEmployees, DMyCanceled> p;
		{
			SPA::CAutoLock al(this->m_csCache);
			p = this->m_mapUpload[index];
			this->m_mapUpload.erase(index);
		}
		if (p.second)
			p.second(index);
	})) {
		SPA::CAutoLock al(this->m_csCache);
		m_mapUpload.erase(index);
		return 0;
	}
	return index;
}