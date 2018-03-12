using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PdfSharp;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using PdfSharp.Pdf.IO;
using System.Net;

namespace GeoLab100.Controllers
{
    public class LabPDFBuilderController : Controller
    {
        // GET: LabPDFBuilder
        public ActionResult Index()
        {
            return View();
        }

        public void BuildLabPDF(string labName, string labString)
        {
            //New PDF
            PdfDocument labPDF = new PdfDocument();
            labPDF.Info.Title = labName;

            //Add Page to Start
            PdfPage page = labPDF.AddPage();

            //Draw Page
            DrawPage(page);

            //Save Doc in Current Directory
            string fileName = "" + labName + ".pdf";
            labPDF.Save(fileName);

            //Optionally View PDF (User Will Need to Manually Download)
            //Process.Start(fileName);

            //Or Just Download it Straight-Off
            DownloadPDF();
        }

        private void DrawPage(PdfPage page)
        {
            //Page Objects
            XGraphics gfx = XGraphics.FromPdfPage(page);
            XFont font = new XFont("Verdana", 20, XFontStyle.BoldItalic);

            String labString = "";
            //Add LabString Content to PDF via Drawing
            gfx.DrawString(labString, font, XBrushes.Black, new XRect(0, 0, page.Width, page.Height), XStringFormats.Center);
        }

        private void DrawImage(PdfPage page, string imageURL)
        {
            //Request Image from URL via HTTP Web Request
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(@imageURL);
            HttpWebResponse res = (HttpWebResponse)req.GetResponse();

            XImage image;

            if (res.StatusCode == HttpStatusCode.OK)
            {
                //Bitmap bmp = (Bitmap)Image.FromStream(res.GetResponseStream(), true, true);
                //image = XImage.FromGdiPlusImage(bmp);
            }

            else
            {
                image = null;

               /* The non-existent image URL
                    <img src="https://ik.imagekit.io/demo/img/non_existent_image.jpg" />
                    Specifying the default image to be displayed in the URL
                    <img src="https://ik.imagekit.io/demo/img/tr:di-medium_cafe_B1iTdD0C.jpg/non_existent_image.jpg" /> */
            }

            //Left position in point
            //double x = (250 - image.PixelWidth * 72 / image.HorizontalResolution) / 2;
            double x = 0;
            XGraphics gfx = XGraphics.FromPdfPage(page);
            //gfx.DrawImage(image, x, 0);
        }

        private void DownloadPDF()
        {
            
        }
    }
}