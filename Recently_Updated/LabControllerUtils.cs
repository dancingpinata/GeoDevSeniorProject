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
    public partial class LabController
    {
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
        /*==========================================
         * Given a lab, serialize it into a string
        ==========================================*/
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
        /*==============================================
         * Given a XML-encoded Lab string, deserialize it into a Lab object
         * ===========================================*/
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
        /*=================================================
         * Creates a default lab view model with the
         * following properties:
         * DateTimeCreated is set to time of object's creation as expected.
         * DateTimePublished is null
         * IsOverridden and IsPublished are false
         * Name, LabID, and Lab's title are each labKey
         * Default Lab has one title-less, content-less exercise 
         * ==============================================*/
        private ViewModels.LabViewModel DefaultLabViewModel()
        {
            string now = DateTime.Now.ToString();
            ViewModels.LabViewModel model;
            string key = GenerateID(labKey);
            Models.Lab lab = new Models.Lab()
            {
                Title = labKey,
                Intro = "",
                DueDate = null,
                ExerciseList = new List<Models.Exercise>()
                    {
                        new Models.Exercise()
                        {
                            ExerciseTitle = "Test Exercise",
                            Content = "Lorem Ipsum"
                        }
                    }
            };
            model = new ViewModels.LabViewModel(lab);
            model.DateTimeCreated = now;
            model.Name = labKey;
            model.LabID = key;
            model.IsOverridden = false;
            model.IsPublished = false;
            return model;
        }
        /*==========================================
         * Attempt to import the lab view model. If
         * succesful, function will return will return true and model
         * is set. Otherwise, return false and model will be null.
         * (Intent is not to use model if method returns false).
         * =======================================*/
        private ViewModels.LabViewModel TryImportLabViewModel()
        {
            ViewModels.LabViewModel model = null;
            try
            {
                string sql = "USE GEOL100LABS; SELECT * FROM Labs WHERE Lab_ID = @key";
                using (var connection = ConnectToServer())
                {
                    using (var cmd = new MySqlCommand(sql, connection))
                    {
                        cmd.Parameters.AddWithValue("@key", labKey);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string myLab = reader["Content"].ToString();
                                Models.Lab lab = DeserializeLab(myLab);
                                model = new ViewModels.LabViewModel(lab);
                                model.Name = reader["Lab_Name"].ToString();
                                model.LabID = reader["Lab_ID"].ToString();
                                model.DateTimeCreated = reader["Date_Time_Created"].ToString();
                                bool b;
                                if (bool.TryParse(reader["Is_Published"].ToString(), out b))
                                {
                                    model.IsPublished = b;
                                    if (b)
                                        model.DateTimePublished = reader["Date_Time_Published"].ToString();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                model = DefaultLabViewModel();
            }
            if (model == null)
                model = DefaultLabViewModel();
            return model;
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
    }
}