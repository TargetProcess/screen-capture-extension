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
    './export',

    './paint-manager',
    './rest-api',
    './storage'
], function(Line, Settings, Add, Crop, Pencil, Rect, Circle, Arrow, Text, Color, Cursor, Undo, Export, PaintManager, RestApi, storage){

    return React.createClass({

        getInitialState: function() {

            var imageUrl = window.screenshotUrl || '';
            var imageSelection = window.screenshotSelection || null;

            return {
                restApi: new RestApi(),
                paintManager: new PaintManager({
                    width: 4
                }),
                selectedTool: 'rect',
                imageUrl: imageUrl,
                imageSelection: imageSelection
            };
        },

        loadImage: function(imageUrl, imageSelection) {

            this.state.paintManager.start('imageView', imageUrl, imageSelection).then(function() {
                this.state.paintManager.selectTool(this.state.selectedTool);

                if (imageSelection) {
                    this.state.paintManager.exportDataURL()
                    .then(function(data) {
                        storage.set('imageUrl', data, 'local');
                    })
                    .done();
                } else {
                    storage.set('imageUrl', imageUrl, 'local');
                }
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
                storage.set('imageUrl', e.target.result, 'local');
                this.state.paintManager.setImageAsBackground(e.target.result);
            }.bind(this);
            reader.readAsDataURL(e.dataTransfer.files[0]);
        },

        componentDidMount: function() {

            Q.all([
                storage.get('imageUrl', 'local'),
                storage.get('tool')
            ])
            .spread(function(imageUrl, tool) {
                this.setState({
                    imageUrl: this.state.imageUrl || imageUrl,
                    selectedTool: tool || this.state.selectedTool
                });

                this.loadImage(this.state.imageUrl, this.state.imageSelection);

            }.bind(this));

            this.state.paintManager.onToolSelected.add(function(name) {

                this.setState({
                    selectedTool: name
                });
                storage.set('tool', name);
            }.bind(this));
        },

        render: function() {
            return (
                <div className="editor">
                    <div className="editor__tools">
                        <nav className="tools">
                            <ul className="tools__panel">
                                <Add paintManager={this.state.paintManager} restApi={this.state.restApi} />
                                <Export paintManager={this.state.paintManager} restApi={this.state.restApi} title="export to PNG" />
                                <Undo paintManager={this.state.paintManager} />
                                <li className="tools__separator-shortest"></li>
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
                                <li className="tools__separator-short"></li>
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
