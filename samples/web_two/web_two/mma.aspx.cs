﻿using System;
using System.Threading.Tasks;
namespace web_two {
    public partial class CMma : System.Web.UI.Page {
        protected void Page_Load(object sender, EventArgs e) {
            if (!IsPostBack) ExecuteSql();
        }
        protected void txtExecute_Click(object sender, EventArgs e) {
            ExecuteSql();
        }
        private void ExecuteSql() {
            string sql = "SELECT MAX(amount),MIN(amount),AVG(amount) FROM payment";
            string filter = txtFilter.Text.Trim();
            if (filter.Length > 0) sql += (" WHERE " + filter);
            var handler = Global.Slave.SeekByQueue(); //seek a handler from socket pool
            if (handler == null) {
                txtResults.Text = "All hosts are inaccessible at this time now"; return;
            }
            TaskCompletionSource<bool> tcs = new TaskCompletionSource<bool>();
            bool ok = handler.Execute(sql, (h, r, err, affected, fail_ok, vtId) => {
                if (r != 0) {
                    txtResults.Text = err;
                    tcs.SetResult(false);
                } else
                    tcs.SetResult(true);
            }, (h, vData) => {
                txtResults.Text = string.Format("Max={0}, Min={1}, Avg={2}", vData[0], vData[1], vData[2]);
            });
            Task<bool> task = tcs.Task;
            //don't use WaitAll because it is designed for easy async to sync in single thread environment
            if (!task.Wait(5000)) txtResults.Text = "Querying max, min and avg timed out";
            else {
                /* you can asynchronously execute other SQL statements here and push results onto browsers
                 * by ASP.NET SignalR to improve web response
                */
            }
        }
    }
}