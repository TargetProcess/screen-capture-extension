define([
    './line',
    './settings',
    './add',
    './crop',
    './pencil',
    './rect',
    './circle',
    './arrow',
    './text',
    './color',
    './cursor',
    './undo',
    './paint-manager',
    './rest-api'
], function(Line, Settings, Add, Crop, Pencil, Rect, Circle, Arrow, Text, Color, Cursor, Undo, PaintManager, RestApi){

    var storage = window.localStorage;

    return React.createClass({

        getInitialState: function() {

            var imageUrl = window.screenshotUrl || storage.getItem('imageUrl') || '';
            storage.setItem('imageUrl', imageUrl);

            return {
                restApi: new RestApi(),
                paintManager: new PaintManager({
                    width: 2
                }),
                selectedTool: storage.getItem('tool') || 'rect',
                imageUrl: imageUrl
            };
        },

        loadImage: function(imageUrl) {

            this.state.paintManager.start('imageView', imageUrl).then(function() {
                this.state.paintManager.selectTool(this.state.selectedTool);
            }.bind(this));
        },

        onDragOver: function(e) {

            var source = e.dataTransfer;
            var items = (source.files && source.files.length) ? source.files : source.items;

            if (items && items.length) {
                var item = items[0];
                if (item.type.match(/image\/([a-z]+)/)) {
                    e.preventDefault();
                    e.nativeEvent.dataTransfer.dropEffect = 'move';
                }
            }
        },

        onDrop: function(e) {

            e.preventDefault();
            var reader = new FileReader();
            reader.onload = function(e) {
                storage.setItem('imageUrl', e.target.result);
                this.state.paintManager.setImageAsBackground(e.target.result);
            }.bind(this);
            reader.readAsDataURL(e.dataTransfer.files[0]);
        },

        componentDidMount: function() {

            this.state.paintManager.onToolSelected = function(name) {

                this.setState({
                    selectedTool: name
                });
                storage.setItem('tool', name);
            }.bind(this);
            this.loadImage(this.state.imageUrl);
        },

        render: function() {
            return (
                <div className="editor">
                    <div className="editor__tools">
                        <nav className="tools">
                            <ul className="tools__panel">
                                <Add paintManager={this.state.paintManager} restApi={this.state.restApi} />
                                <Undo paintManager={this.state.paintManager} />
                                <Cursor className={this.state.selectedTool === 'cursor' ? 'selected' : ''} paintManager={this.state.paintManager} />

                                <Pencil className={this.state.selectedTool === 'pencil' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Arrow className={this.state.selectedTool === 'arrow' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Line className={this.state.selectedTool === 'line' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Rect className={this.state.selectedTool === 'rect' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Circle className={this.state.selectedTool === 'circle' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Text className={this.state.selectedTool === 'text' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Crop className={this.state.selectedTool === 'crop' ? 'selected' : ''} paintManager={this.state.paintManager} />
                                <Color paintManager={this.state.paintManager} />

                            </ul>
                            <div className="tools__separator"></div>
                            <ul className="tools__panel">
                                <Settings paintManager={this.state.paintManager} restApi={this.state.restApi} />
                            </ul>
                        </nav>
                    </div>
                    <div className="editor__area" tabIndex="0" onDragOver={this.onDragOver}  onDrop={this.onDrop}>
                        <canvas id="imageView" />
                    </div>
                </div>
            );
        }
    });
});
