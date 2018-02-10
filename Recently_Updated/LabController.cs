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
using GeoLab100.Models;

namespace GeoLab100.Controllers
{
    /* ==============================================================================*
     *  This controller has three views
     *   - Lab Editor
     *   - Lab Manager
     *   - Display (rough preview for client demo)
     * ==============================================================================*/
    public class LabController : Controller
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
            try
            {
                if (!TryImportLabViewModel(out model))
                    model = DefaultLabViewModel();
            }
            catch (Exception)
            {
                model = DefaultLabViewModel();
            }
            return View(model);
        }

        /* ==============================================================================*
         *  Go to Lab Manager view
         * ==============================================================================*/
        public ActionResult LabManagerView()
        {
            return View("LabManagerView");
        }

        /* ==============================================================================*
         *  Import the existing lab under the global lab key
         *      and display 
         * ==============================================================================*/
        public ActionResult DisplayLab(string id)
        {
            labKey = id;
            Models.Lab lab = ImportLab();
            return View(lab);
        }

        /* ==============================================================================*
         *  Prints the recieved lab to the console
         *      not currently used but may be useful 
         * ==============================================================================*/
        private void PrintLab(Models.Lab lab)
        {
            Debug.WriteLine(lab.Title);

            foreach (Models.Exercise e in lab.ExerciseList)
            {
                Debug.WriteLine(e.ExerciseTitle);
                Debug.WriteLine(e.Content);
            }
        }
        
        private List<object> LabList()
        {
            string sql = "USE GEOL100LABS; SELECT * FROM Labs;";
            List<object> labs = new List<object>();
            using (MySqlConnection connection = ConnectToServer())
            {
                using (MySqlCommand cmd = new MySqlCommand(sql, connection))
                {
                    MySqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        Models.Lab lab = DeserializeLab(reader["Content"].ToString());
                        string due = (lab.DueDate != null) ? lab.DueDate.ToString() : null;
                        bool isPublished = false;
                        bool.TryParse(reader["Is_Published"].ToString(), out isPublished);
                        DateTime? dtCreated = null, dtPublished = null;
                        DateTime temp;
                        if (DateTime.TryParse(reader["Date_Time_Created"].ToString(), out temp))
                            dtCreated = temp;
                        if (DateTime.TryParse(reader["Date_Time_Published"].ToString(), out temp))
                            dtPublished = temp;
                        labs.Add(new
                        {
                            LabName = reader["Lab_Name"].ToString(),
                            LabID = reader["Lab_ID"].ToString(),
                            IsPublished = isPublished,
                            DateTimeCreated = dtCreated,
                            DateTimePublished = dtPublished,
                            DueDate = due
                        });
                    }
                }
            }
            return labs;
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
            lab.DueDate = d;
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
        public ActionResult Save(string title, string[] exerciseTitles, string[] exerciseContent, string[] exerciseResponses, string name, string key, string created)
        {
            labKey = key;
            DateTime dtCreated = DateTime.Parse(created);
            Models.Lab lab = new Models.Lab();
            lab.Title = title;
            /* Lab DueDate will be set from the Lab Manager once it is created
                I left this hear as an example of the expected format 
            */
            //lab.DueDate = new DateTime(2017, 07, 07);
            lab.ExerciseList = new List<Models.Exercise>();
            int children = 0;
            for (int i = 0; i < exerciseTitles.Length; i++)
            {
                Models.Exercise e = new Models.Exercise()
                {
                    ExerciseTitle = exerciseTitles[i],
                    Content = exerciseContent[i],
                    ExerciseList = new List<Exercise>(),
                    Response = ""
                };
                e.ExerciseList = new List<Exercise>();
                if (!int.TryParse(exerciseResponses[i], out children))
                    e.Response = exerciseResponses[i]; // This feature has yet to be implimented
                else
                    for(int j = 0; j < children; j++)
                        e.ExerciseList.Add(new Exercise()
                        {
                            ExerciseTitle = exerciseTitles[++i],
                            Content = exerciseContent[i],
                            Response = exerciseResponses[i]
                        });
                lab.ExerciseList.Add(e);
            }
            /* Lab is deleted due to overwritting problems
                Another way to solve this problem should eventually be researched
                to lighten the load of server calls
            */
            DeleteLab();

            string sql = "USE GEOL100LABS; INSERT INTO Labs(Lab_Name, Lab_ID, Content, Is_Overriden, Date_Time_Created, Is_Published) VALUES (@name, @id, @content, @overridden, @created, 'False');";
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

                    cmd.ExecuteNonQuery();
                }
            }
            return Json("true"); // the content of this return statement is currently irrelevant and can be changed to any string that you want
        }

        private string SerializeLab(Lab lab)
        {
            string myLab = "";
            XmlSerializer serializer = new XmlSerializer(lab.GetType());
            using (StringWriter writer = new StringWriter())
            {
                serializer.Serialize(writer, lab);
                myLab = writer.ToString();
            }
            return myLab;
        }

        private Models.Lab DeserializeLab(string content)
        {
            Models.Lab lab = null;
            XmlSerializer serializer = new XmlSerializer(typeof(Models.Lab));
            using (StringReader sReader = new StringReader(content))
            {
                lab = (Models.Lab)serializer.Deserialize(sReader);
            }
            return lab;
        }
        private ViewModels.LabViewModel DefaultLabViewModel()
        {
            string now = DateTime.UtcNow.ToString();
            ViewModels.LabViewModel model;
            string key = GenerateID(labKey);
            Models.Lab lab = new Models.Lab()
            {
                Title = labKey,
                Intro = "",
                DueDate = DateTime.UtcNow,
                ExerciseList = new List<Models.Exercise>()
                    {
                        new Models.Exercise()
                        {
                            ExerciseTitle = "",
                            Content = "",
                            Response = ""
                        }
                    }
            };
            model = new ViewModels.LabViewModel(lab);
            model.DateTimeCreated = DateTime.UtcNow.ToLongTimeString();
            model.Name = labKey;
            model.LabID = key;
            model.IsOverridden = false;
            model.IsPublished = false;
            return model;
        }
        private bool TryImportLabViewModel(out ViewModels.LabViewModel model)
        {
            model = null;
            string sql = "USE GEOL100LABS; SELECT * FROM Labs WHERE Lab_ID = @key";
            using (var connection = ConnectToServer())
            {
                using (var cmd = new MySqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@key", labKey);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while(reader.Read())
                        {
                            string myLab = reader["Content"].ToString();
                            Models.Lab lab = DeserializeLab(myLab);
                            model = new ViewModels.LabViewModel(lab);
                            model.Name = reader["Lab_Name"].ToString();
                            model.LabID = reader["Lab_ID"].ToString();
                            model.DateTimeCreated = reader["Date_Time_Created"].ToString();
                            bool b;
                            if (bool.TryParse(reader["Is_Published"].ToString(), out b))
                                if (model.IsPublished = b)
                                    model.DateTimePublished = reader["Date_Time_Published"].ToString();
                        }
                    }
                }
            }
            return model != null;
        }
        [HttpPost]
        public ActionResult CheckLabName(string name)
        {
            string msg = "OK";
            using (var connection = ConnectToServer())
            {
                using (var cmd = new MySqlCommand("USE GEOL100LABS; SELECT Lab_Name FROM Labs WHERE Lab_Name = @name", connection))
                {
                    cmd.Parameters.AddWithValue("@name", name);
                    using (var reader = cmd.ExecuteReader())
                        if (reader.Read())
                            msg = "Lab with that name already exists.";
                }
            }
            if (msg != "OK")
                return new HttpStatusCodeResult(400, msg);
            return Json("OK");
        }
        /*=============================
         * Generate unique ID for lab 
         * ==========================*/
        private string GenerateID(string name)
        {
            uint i = (uint)name.GetHashCode();
            name = name.ToLower().Replace(' ', '-');
            string s = "";
            for (int c = 0; c < name.Length && s.Length < 49; c++)
                if ((name[c] >= 'a' && name[c] <= 'z')
                    || (name[c] >= '0' && name[c] <= '9')
                    || name[c] == '-')
                    s += name[c];
            string id = "";
            string sql = "USE GEOL100LABS; SELECT Lab_ID FROM Labs WHERE Lab_ID = @param1;";
            using (var connection = ConnectToServer())
            {
                bool flag = false;
                do
                {
                    id = s + '-' + i;
                    i++;
                    using (var cmd = new MySqlCommand(sql, connection))
                    {
                        cmd.Parameters.AddWithValue("@param1", id);
                        using (var reader = cmd.ExecuteReader())
                            flag = reader.Read();
                    }
                }
                while (flag);
            }
            return id;
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

        
        [HttpPost]
        public ActionResult DeleteLab(string id)
        {
            labKey = id;
            DeleteLab();
            return Json("OK");
        }
        [HttpPost]
        public ActionResult PublishLab(string id, string isPublished)
        {
            string sql = "USE GEOL100LABS; UPDATE Labs SET Is_Published = @published, Date_Time_Published = @dtPublish WHERE Lab_ID = @id";
            using (var connection = ConnectToServer())
            {
                using (var cmd = new MySqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@published", isPublished);
                    object dtPublish = (isPublished.ToLower() == "true") ? (object)DateTime.UtcNow : DBNull.Value;
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