using System;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Text.RegularExpressions;
using System.Drawing;
using System.Net;
using System.IO;
using System.Text;

namespace AZSaveImage
{
	static class Program
	{
		[STAThread]
		static void Main(string[] args)
		{
			var savefile = new SaveFileDialog();
			savefile.RestoreDirectory = true;
			savefile.Title = "이미지 저장";
			savefile.Filter = "이미지 파일|*.*";
			savefile.OverwritePrompt = true;

			string savepath = Path.Combine(Environment.CurrentDirectory, "AzImageSave.dat");

			try
			{
				savefile.InitialDirectory = File.ReadAllText(savepath, Encoding.UTF8);
			}
			catch
			{
				savefile.InitialDirectory = Environment.CurrentDirectory;
			}

			try
			{
				if (args.Length > 0)
				{
					foreach (string url in args[0].Split(','))
					{
						string filename = url.Substring(url.LastIndexOf('/') + 1);

						if (filename.IndexOf(':') >= 0)
							filename = filename.Substring(0, filename.IndexOf(':'));

						savefile.FileName = filename;

						if (savefile.ShowDialog() == DialogResult.OK)
							Download(url, savefile.FileName);
						else
							break;

						savefile.InitialDirectory = Path.GetDirectoryName(savefile.FileName);
					}

					File.WriteAllText(savepath, savefile.InitialDirectory, Encoding.UTF8);
				}
			}
			catch
			{ }
		}

		public static void Download(string url, string path)
		{
			File.Delete(path);

			try
			{
				WebRequest req = WebRequest.Create(url);
				using (WebResponse res = req.GetResponse())
				{
					using (Stream streamHttp = res.GetResponseStream())
					{
						using (Stream streamFile = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None))
						{
							byte[] buff = new byte[4096];
							int read;

							while ((read = streamHttp.Read(buff, 0, 4096)) > 0)
								streamFile.Write(buff, 0, read);

							streamFile.Flush();
						}
					}
				}	
			}
			catch
			{
				File.Delete(path);
			}
		}
	}
}
