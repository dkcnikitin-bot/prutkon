var fso = new ActiveXObject("Scripting.FileSystemObject");
var folder = fso.GetFolder(".");
var files = new Enumerator(folder.Files);
for (; !files.atEnd(); files.moveNext()) {
    var file = files.item();
    if (fso.GetExtensionName(file.Name).toLowerCase() === "js") {
        var stream = file.OpenAsTextStream(1);
        if (!stream.AtEndOfStream) {
            var content = stream.ReadAll();
            try {
                new Function(content);
            } catch (e) {
                WScript.Echo(file.Name + ": " + e.message);
            }
        }
        stream.Close();
    }
}
