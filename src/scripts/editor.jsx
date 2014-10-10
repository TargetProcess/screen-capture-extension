/**
 * @jsx React.DOM
 */

 /* globals chrome */

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

    'use strict';

    return React.createClass({

        getInitialState: function() {

            return {
                restApi: new RestApi(),
                paintManager: new PaintManager({
                    width: 4
                }),
                selectedTool: 'rect',
                imageUrl: null,
                imageSelection: null
            };
        },

        loadImage: function(imageUrl, imageSelection) {

            return this.state.paintManager
                .start('imageView', imageUrl, imageSelection)
                .then(function() {

                if (imageSelection) {
                    return this.state.paintManager.exportDataURL()
                        .then(function(data) {
                            return storage.set('imageUrl', data, 'local');
                        })
                        .done();
                } else {
                    return storage.set('imageUrl', imageUrl, 'local');
                }
            }.bind(this))
            .then(function() {
                return storage.get('tool');
            })
            .then(function(tool) {
                this.state.paintManager.selectTool(tool);
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

            storage.get('tool').then(function(tool) {
                if (tool) {
                    this.setState({
                        selectedTool: tool
                    });
                }
            }.bind(this));

            this.state.paintManager.onToolSelected.add(function(name) {

                this.setState({
                    selectedTool: name
                });
                storage.set('tool', name);
            }.bind(this));


            var initLocal = function() {

                storage
                    .get('imageUrl', 'local')
                    .then(function(image) {
                        return this.loadImage(image, null).then(function() {
                            return image;
                        });
                    }.bind(this))
                    .then(function(image) {
                        this.setState({
                            imageUrl: image,
                            imageSelection: null
                        });
                    }.bind(this));
            }.bind(this);

            if (!(chrome && chrome.tabs)) {
                initLocal();
            }

            this.chromeListener = function(request) {

                switch (request.action) {

                    case 'editor:startExternal':

                        this
                            .loadImage(request.image, request.selection)
                            .then(function() {
                                this.setState({
                                    imageUrl: request.image,
                                    imageSelection: request.selection
                                });
                            }.bind(this));
                        break;

                    case 'editor:startLocal':

                        initLocal();
                        break;
                }
            }.bind(this);

            chrome.runtime.onMessage.addListener(this.chromeListener);

            chrome.tabs.getCurrent(function(tab) {
                chrome.runtime.sendMessage({
                    action: 'editor:ready',
                    tabId: tab.id
                });
            });
        },

        componentWillUnmount: function() {
            chrome.runtime.onMessage.removeListener(this.chromeListener);
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
