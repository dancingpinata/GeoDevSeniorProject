using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GeoLab100.Models
{
    public class Exercise
    {
        public string ExerciseTitle { get; set; }
        public string ExerciseID { get; set; }
        public string Content { get; set; }
        public string Response { get; set; }
        public List<Exercise> ExerciseList { get; set; }
    }
}