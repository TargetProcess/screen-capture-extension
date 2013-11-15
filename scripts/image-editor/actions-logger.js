define([], function() {

    var ELEMENT_ID = 'ctl00_ContentPlaceHolder1_hfGeneratedScriptContent';

    var ActionsLogger = function(paintManager, UiManager) {
        this.paintManager = paintManager;
        this.UiManager = UiManager;
        this._UndoStack = [];
    };

    ActionsLogger.prototype = {

        kSequenceStartString: "/*s*/\r\n",
        kSequenceStartStringForSearch: "/*s*/",

        addScriptWithUndoSupport : function (script, shouldUndo) {
            var console = document.getElementById(ELEMENT_ID);

            if (console != null) {
                var undoText = "";
                if (shouldUndo) {
                    undoText = this.kSequenceStartString;

                    this.UiManager.Enable("undo");
                    this.UiManager.Disable("redo");
                    this._UndoStack = [];
                }

                console.value += undoText + script;
            }
        },

        addScript: function (script) {
            var retVal = this.addScriptWithUndoSupport(script, true);

            //UiManager.ButtonFlash();
            this.UiManager.AllowSubmit();

            this.UiManager.ConsoleWrite(script);

            return retVal;
        },

        addScriptWithNoUndo: function(script) {
            return this.addScriptWithUndoSupport(script, false);
        },

        startSequence: function() {
            this.addScript(this.kSequenceStartString);
        },

        isLoggerStarted: function () {
            var lines = this.getScript().split("\n");
            return (lines.length > 5);
        },

        getScript: function () {
            var console = document.getElementById(ELEMENT_ID);
            if (console != null) {
                return console.value;
            }
            return "";
        },

        setScript: function (script) {
            var console = document.getElementById(ELEMENT_ID);
            if (console != null) {
                console.value = script;
            }
        },

        Undo: function () {
            var scriptContent = this.getScript();
            var lastSequenceIndex = scriptContent.lastIndexOf(this.kSequenceStartStringForSearch);

            if (lastSequenceIndex < 0) { //no last action available
                this.UiManager.Disable("undo");
            }
            else {
                var undoScript = scriptContent.slice(lastSequenceIndex, scriptContent.length);
                scriptContent = scriptContent.slice(0, lastSequenceIndex);
                this.paintManager.RepaintByScript(scriptContent);
                this.setScript(scriptContent);

                this._UndoStack.push(undoScript);

                this.UiManager.Enable("redo");
            }
        },

        Redo: function () {
            var redoScript = this._UndoStack.pop();

            if (redoScript) {
                var scriptContent = this.getScript();
                scriptContent = scriptContent + redoScript;
                this.paintManager.RepaintByScript(scriptContent);
                this.setScript(scriptContent);
            }
            else {
                this.UiManager.Disable("redo");
            }
        }

    };

    return ActionsLogger;

});