using MySql.Data.MySqlClient;
using MySQLLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GeoLab100.Controllers
{
    public class LoginController : Controller
    {
        private string UserName;
        private string Password;
        private string LoginAs;
        
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        // returns default view
        public ActionResult MyView()
        {
            
            //return Json();
            return View();
        }
        [HttpPost]
        public ActionResult Test(string EWUid, string pw, string la)
        {

            UserName = EWUid;
            Password = pw;
            LoginAs = la;
            bool match = false;
            using (var connection = ConnectToServer())
            {
                string sql = "USE GEOL100LABS; SELECT Student_ID FROM `Login_Info` WHERE Student_ID = @id AND Password = @pass;";
                using (var cmd = new MySqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@id", UserName);
                    cmd.Parameters.AddWithValue("@pass", Password);

                    MySqlDataReader reader = cmd.ExecuteReader();
                    while(reader.Read())
                    {
                        match = true;
                    }
                }
            }
                
            if (!match)
                return new HttpStatusCodeResult(400); // return on failure
            return Json(new { user = UserName, type = LoginAs });
        }

        /* ==============================================================================* 
         *  Add Lab to server database - username 'bananas' has full access
         * 
         *  username: bananas              
         *  password: zAb7s!agapub          
         * ==============================================================================*/
        private MySqlConnection ConnectToServer()
        {
            MySqlConnection connection = DatabaseUtil.CreateMySqlConnection("146.187.134.39", "bananas", "zAb7s!agapub", database: "");
            return connection;
        }
    }
}