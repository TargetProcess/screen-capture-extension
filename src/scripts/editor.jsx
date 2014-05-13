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


    return React.createClass({

        getInitialState: function() {

            var storage = window.localStorage;
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
                    <div className="editor__area"><canvas id="imageView" /></div>
                </div>
            );
        }
    });
});
