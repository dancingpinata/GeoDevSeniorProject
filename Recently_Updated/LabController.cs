/* ==============================================================================*
 *  Drew Scholz - Team 5: Geology - Spring 2017 
 * 
 *  This controller has three Lab model views (Lab Editor, Lab Manager, Display Lab)
 *  and contains methods to:
 *   - import, save, and delete a lab
 *   - connect to the server
 *   - commented methods for saving an image and serializing to a path
 *  
 * ==============================================================================*/

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Web;
using System.Web.Mvc;
using MySQLLibrary;
using MySql.Data.MySqlClient;
using System.Linq;
using System.Xml.Serialization;
using System.Web.Services;
using System.Web.UI.WebControls;
using System.Net;
using GeoLab100.Models;

namespace GeoLab100.Controllers
{
    /* ==============================================================================*
     *  This controller has three views
     *   - Lab Editor
     *   - Lab Manager
     *   - Display (rough preview for client demo)
     * ==============================================================================*/
    public partial class LabController : Controller
    {
        //private Models.Lab lab = new Models.Lab();
        private string isOverriden = "false";
        private string labKey = "Lab1Key"; // with multiple labs this could be changed to the lab's title?

        /* ==============================================================================*
         *  Go to Lab Editor view
         * ==============================================================================*/
        public ActionResult LabEditorView(string id)
        {
            labKey = id;
            ViewModels.LabViewModel model;
            model = TryImportLabViewModel();
            User user = Session["User"] as User;
            user.CurrentLabState = model;
            return View(user);
        }

        /* ==============================================================================*
         *  Go to Lab Manager view
         * ==============================================================================*/
        public ActionResult LabManagerView()
        {
            User user = Session["User"] as User;
            user.CurrentLabState = null; // user is not in current lab
            return View(user);
        }
        /* ========================================================
         * Go to Lab Directory view. Even though the lines of code
         * are identical to that of LabManagerView(), the two methods
         * are different per ASP.NET MVC, so do not refactor.
         * ======================================================*/
        public ActionResult LabDirectoryView()
        {
            User user = Session["User"] as User;
            user.CurrentLabState = null; // user is not in current lab
            return View(user);
        }
        /* ==============================================================================*
         *  Import the existing lab under the global lab key
         *      and display 
         * ==============================================================================*/
        public ActionResult DisplayLab(string id)
        {
            labKey = id;
            User user = Session["User"] as User;
            ViewModels.LabViewModel lab;
            lab = TryImportLabViewModel();
            user.CurrentLabState = lab;
            return View(user);
        }
        /* ======
         * Retrieve information about labs
         * =====*/
        [HttpPost]
        public ActionResult GetLabs()
        {
            List<object> labs = LabList();
            return Json(labs);
        }
        /* =====================
         * Set the due date
         * ====================*/
        [HttpPost]
        public ActionResult SetDue(string id, string datetime)
        {
            DateTime d;
            DateTime? due = DateTime.TryParse(datetime, out d) ? d : due = null;
            labKey = id;
            Lab lab = ImportLab();
            lab.DueDate = due;
            string content = SerializeLab(lab);
            string sql = "USE GEOL100LABS; UPDATE Labs SET Content = @content WHERE Lab_ID = @id";
            using (var connection = ConnectToServer())
            {
                using (var cmd = new MySqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@content", content);
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.ExecuteNonQuery();
                }
            }
            return Json("OK");
        }
        /* ==============================================================================*
         *  Create and serialize Lab model - ajax called from LabEditor.js
         *  then store on server in a parameterized query
         *  under the global labKey
         * ==============================================================================*/
        [HttpPost]
        public ActionResult Save(string title, string intro,
            string[] exerciseTitles, string[] exerciseContent, string[] exerciseResponses,
            string[] exerciseIds, string name, string key, string created,
            DateTime? due, bool isPublished, DateTime? publishDate)
        {
            labKey = key;
            DateTime dtCreated = DateTime.Parse(created);
            Models.Lab lab = new Models.Lab();
            lab.Title = title;
            lab.Intro = intro;
            /* Lab DueDate will be set from the Lab Manager once it is created
                I left this here as an example of the expected format 
            */
            lab.DueDate = due;
            object pubObj = publishDate; // handle evaluating publish date
            if (pubObj == null)
                pubObj = DBNull.Value;
            lab.ExerciseList = new List<Models.Exercise>();
            List<Exercise> list = new List<Exercise>();
            int children = 0;
            for (int i = 0; i < exerciseTitles.Length; i++)
            {
                Models.Exercise e = new Models.Exercise()
                {
                    ExerciseTitle = exerciseTitles[i],
                    ExerciseID = exerciseIds[i],
                    Content = exerciseContent[i],
                    ExerciseList = new List<Exercise>(),
                    Response = ""
                };
                e.ExerciseList = new List<Exercise>();
                if (!int.TryParse(exerciseResponses[i], out children))
                {
                    e.Response = exerciseResponses[i]; // This feature has yet to be implemented
                    list.Add(e);
                }
                else
                    for (int j = 0; j < children; j++)
                    {
                        i++;
                        Exercise ex = new Exercise()
                        {
                            ExerciseTitle = exerciseTitles[i],
                            ExerciseID = exerciseIds[i],
                            Content = exerciseContent[i],
                            Response = exerciseResponses[i]
                        };
                        e.ExerciseList.Add(ex);
                        list.Add(ex);
                    }
                lab.ExerciseList.Add(e);
            }
            /*using (var connection = ConnectToServer())
            {
                foreach (Exercise e in list)
                {
                    string insert = "USE GEOL100LABS; INSERT IGNORE INTO Exercises(Lab_ID, Exercise_ID, Exercise_Title) VALUES (@lab, @exercise, @title)";
                    using (var cmd = new MySqlCommand(insert, connection))
                    {
                        cmd.Parameters.AddWithValue("@lab", labKey);
                        cmd.Parameters.AddWithValue("@exercise", e.ExerciseID);
                        cmd.Parameters.AddWithValue("@title", e.ExerciseTitle);
                        cmd.ExecuteNonQuery();
                    }
                }
            }*/
            /* Lab is deleted due to overwritting problems
                Another way to solve this problem should eventually be researched
                to lighten the load of server calls
            */
            DeleteLab();

            string sql = "USE GEOL100LABS; INSERT INTO Labs(Lab_Name, Lab_ID, Content, Is_Overriden, Date_Time_Created, Is_Published, Date_Time_Published) VALUES (@name, @id, @content, @overridden, @created, @ispublished, @publish);";
            string myLab = SerializeLab(lab);
            // These 'using' statments are the best practice for iDisposable objects
            using (MySqlConnection connection = ConnectToServer())
            {
                using (MySqlCommand cmd = new MySqlCommand(sql, connection))
                {
                    // This is the parameterized query style I choose
                    cmd.Parameters.AddWithValue("@name", name);
                    cmd.Parameters.AddWithValue("@id", labKey);
                    cmd.Parameters.AddWithValue("@content", myLab);
                    cmd.Parameters.AddWithValue("@overridden", isOverriden);
                    cmd.Parameters.AddWithValue("@created", dtCreated);
                    cmd.Parameters.AddWithValue("@ispublished", isPublished ? "True" : "False");
                    cmd.Parameters.AddWithValue("@publish", pubObj);
                    cmd.ExecuteNonQuery();
                }

                foreach (Exercise e in list)
                {
                    string insert = "USE GEOL100LABS; INSERT IGNORE INTO Exercises(Lab_ID, Exercise_ID, Exercise_Title) VALUES (@lab, @exercise, @title)";
                    using (var cmd = new MySqlCommand(insert, connection))
                    {
                        cmd.Parameters.AddWithValue("@lab", labKey);
                        cmd.Parameters.AddWithValue("@exercise", e.ExerciseID);
                        cmd.Parameters.AddWithValue("@title", e.ExerciseTitle);
                        cmd.ExecuteNonQuery();
                    }
                }
            }
            return Json("true"); // the content of this return statement is currently irrelevant and can be changed to any string that you want
        }

        [HttpPost]
        public ActionResult CheckLabName(string name)
        {
            if (name == null || name == "") // name cannot be null or empty
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Lab name is empty.");
            if (name.Length > 100) // name cannot be too long
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Lab name is too long.");
            string msg = "OK";
            using (var connection = ConnectToServer())
            {
                using (var cmd = new MySqlCommand("USE GEOL100LABS; SELECT Lab_Name FROM Labs WHERE Lab_Name = @name", connection))
                {
                    cmd.Parameters.AddWithValue("@name", name);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            msg = "Lab with that name already exists.";
                        }
                    }
                }
            }
            if (msg != "OK")
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, msg);
            return Json("OK");
        }
        /* ==============================================================================*
         *  Retrieve lab from server, deserialize and return as Lab object
         * ==============================================================================*/
        private Models.Lab ImportLab()
        {
            string sql = "USE GEOL100LABS; SELECT * FROM Labs WHERE Lab_ID = @param1 AND Is_Overriden = @param2;";
            string myLab = "";
            Models.Lab lab;

            using (MySqlConnection connection = ConnectToServer())
            {
                using (MySqlCommand cmd = new MySqlCommand(sql, connection))
                {

                    cmd.Parameters.AddWithValue("@param1", labKey);
                    cmd.Parameters.AddWithValue("@param2", isOverriden);

                    MySqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        myLab = (string)reader["Content"];
                    }
                }
            }
            lab = DeserializeLab(myLab);
            return lab;
        }
        /* =======================================
         * AJAX call to delete lab
         * =====================================*/
        [HttpPost]
        public ActionResult DeleteLab(string id)
        {
            labKey = id;
            DeleteLab();
            return Json("OK");
        }
        /* =======================================
         * AJAX call to publish lab
         * =====================================*/
        [HttpPost]
        public ActionResult PublishLab(string id, string isPublished)
        {
            string sql = "USE GEOL100LABS; UPDATE Labs SET Is_Published = @published, Date_Time_Published = @dtPublish WHERE Lab_ID = @id";
            using (var connection = ConnectToServer())
            {
                using (var cmd = new MySqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@published", isPublished);
                    object dtPublish = (isPublished.ToLower() == "true") ? (object)DateTime.Now : DBNull.Value;
                    cmd.Parameters.AddWithValue("@dtPublish", dtPublish);
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.ExecuteNonQuery();
                }
            }
            return Json("OK");
        }
        /* ==============================================================================*
         *  Delete serialized lab from the server
         * ==============================================================================*/
        private void DeleteLab()
        {
            string sql = "USE GEOL100LABS; DELETE FROM Labs WHERE Lab_ID = @param1 AND Is_Overriden = @param2;";

            using (MySqlConnection connection = ConnectToServer())
            {
                using (MySqlCommand cmd = new MySqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@param1", labKey);
                    cmd.Parameters.AddWithValue("@param2", isOverriden);

                    cmd.ExecuteNonQuery();
                }
            }
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

        /* ==============================================================================*
         *  Commented out methods, saved for potential use only
         * ==============================================================================*/

        /* upload image
        protected void Upload(object sender, EventArgs e)
        {
            FileUpload FileUpload1 = new FileUpload();
            if (FileUpload1.HasFile)
            {
                string fileName = Path.GetFileName(FileUpload1.PostedFile.FileName);
                FileUpload1.PostedFile.SaveAs(Server.MapPath("~/Images/") + fileName);
                Response.Redirect(Request.Url.AbsoluteUri);
            }
        }

        /* display image from folder
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                string[] filePaths = Directory.GetFiles(Server.MapPath("~/Images/"));
                List<ListItem> files = new List<ListItem>();
                foreach (string filePath in filePaths)
                {
                    string fileName = Path.GetFileName(filePath);
                    files.Add(new ListItem(fileName, "~/Images/" + fileName));
                }
                GridView1.DataSource = files;
                GridView1.DataBind();
            }
        } */

        /* serialize lab to path
        IFormatter formatter = new BinaryFormatter();
        Stream stream = new FileStream(this.path,
                                 FileMode.Create,
                                 FileAccess.Write, FileShare.None);
        formatter.Serialize(stream, lab);
        stream.Close();
        */


        /* deserialize lab from path into object
        IFormatter formatter = new BinaryFormatter();
        Stream stream = new FileStream(myLab,
                                  FileMode.Open,
                                  FileAccess.Read,
                                  FileShare.Read);
        Models.Lab lab = (Models.Lab)formatter.Deserialize(stream);
        stream.Close();
        */
    }
}