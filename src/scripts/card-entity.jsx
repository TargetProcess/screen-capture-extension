/**
 * @jsx React.DOM
 */
/*globals TreeFormat */
define([], function(){

    'use strict';

    return React.createClass({

        getInitialState: function() {
            return {
                entity: null,
                isLoaded: false
            };
        },

        componentDidMount: function() {
            Q
                .when(this.loadEntity(this.props.entity))
                .then(function(entity){
                    this.setState({
                        entity: entity,
                        isLoaded: true
                    });
                }.bind(this))
                .done();
        },

        componentWillReceiveProps: function(nextProps) {

            if ((nextProps.entity.Id || nextProps.entity.id) === this.state.entity.Id && nextProps.entity.ModifyDate === this.state.entity.ModifyDate) {
                return;
            }

            this.setState({
                isLoaded: false
            });

            Q
                .when(this.loadEntity(nextProps.entity))
                .then(function(entity){
                    this.setState({
                        entity: entity,
                        isLoaded: true
                    });
                }.bind(this))
                .done();
        },

        loadEntity: function(entity) {
            return this.props.restApi.get('Generals/' + (entity.Id || entity.id), {
                include: '[' + TreeFormat.stringify([
                    'Id',
                    'Name',
                    'Description',
                    'ModifyDate',
                    {'EntityType': 'Name'},
                    {'Attachments': ['Id', 'Name', 'Uri', 'ThumbnailUri']},
                    {'Project': ['Id', 'Name', 'Abbreviation', 'Color']}
                ]) + ']'
            });
        },

        render: function() {

            if (!this.state.entity) {
                return (<div className="card card-loaded"></div>);
            }

            var entity = this.state.entity;


            var attachs = entity.Attachments.Items;
            attachs = attachs.map(function(attach) {
                attach.thumbnailUri = attach.ThumbnailUri.replace(/localhost/, 'localhost:8080').replace(/100/g, '50');
                return attach;
            });

            var url = this.props.restApi.host + '/entity/' + entity.Id;
            var project;
            if (entity.Project) {
                project = <span className="card__project" style={{background: entity.Project.Color}}>{entity.Project.Abbreviation}</span>;
            }

            var style = {
                flexBasis: 50 + 5 * (attachs.length ? attachs.length - 1 : 0) + "px",
                maxWidth: 50 + 5 * (attachs.length ? attachs.length - 1 : 0) + "px",
                height: 50 + 5 * (attachs.length ? attachs.length - 1 : 0) + "px"
            };

            return (
                <div className="card">
                    <div className="card__attachments"  style={style}>
                        {attachs.map(function(attach, i) {
                            return (
                                <div className="card__attachment" style={{left: 5 * i + "px", top: 5 * i + 'px' }}>
                                    <img src={attach.thumbnailUri} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="card__body">
                        <div className="card__id"><a href={url} target="_blank">#{entity.Id}</a></div>
                        <div className="card__name">{entity.Name}</div>
                        <div className="card__description">{entity.Description}</div>
                    </div>
                </div>
            );
        }
    });
});
