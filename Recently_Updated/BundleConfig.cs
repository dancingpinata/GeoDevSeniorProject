using System.Web;
using System.Web.Optimization;

namespace GeoLab100
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/Scripts/jquery-3.1.1.js",
                "~/Scripts/jquery-ui-1.12.1.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js"));
            bundles.Add(new ScriptBundle("~/bundles/summernote").Include(
                "~/Scripts/summernote.js",
                "~/Scripts/ContentEditor.js"));
            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                "~/Scripts/LabUtils.js"));
            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.css",
                "~/Content/themes/base/jquery-ui.css",
                "~/Content/summernote.css",
                "~/Content/Styles.css"));

        }
    }
}