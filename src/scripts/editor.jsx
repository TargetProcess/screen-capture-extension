define(['./area', './line', './settings', './add', './crop', './pencil', './rect',
    './circle',
    './arrow',
    './text',
    './color', './components/paint-manager', './rest-api'], function(Area, Line, Settings, Add, Crop, Pencil, Rect, Circle, Arrow, Text, Color, PaintManager, RestApi){

    return React.createClass({

        displayName: 'zzEditor',

        getInitialState: function() {
            return {
                restApi: new RestApi(),
                paintManager: new PaintManager({
                    color: '#ff5400',
                    width: 2
                }),
                selectedTool: 'pencil'
            };
        },

        componentDidMount: function() {
            this.state.paintManager.start('imageView', 'img/screen.png').then(function(){
               this.state.paintManager.selectTool(this.state.selectedTool);
           }.bind(this));

            this.state.paintManager.onToolSelected(function(name) {
                this.setState({
                    selectedTool: name
                });
            }.bind(this));
        },

        render: function() {
            return (
                <div className="editor">
                    <div className="editor__tools">
                        <nav className="tools">
                            <ul className="tools__panel">
                                <Add paintManager={this.state.paintManager} restApi={this.state.restApi} />

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
                                <Settings paintManager={this.state.paintManager} />
                            </ul>
                        </nav>
                    </div>
                    <div className="editor__area"><canvas id="imageView" /></div>
                </div>
            );
        }
    });

});
