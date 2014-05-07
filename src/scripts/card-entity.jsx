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

            if ((nextProps.entity.Id || nextProps.entity.id) === this.state.entity.Id) {
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
            return this.props.restApi.get('Generals/' + (entity.Id || entity.id), {include: '[Id,Name,EntityType[Name],Attachments[Id,Name,Uri,ThumbnailUri],Project[Id,Name,Abbreviation,Color]]'});
        },

        render: function() {

            if (!this.state.isLoaded) {
                return <div>Loaded</div>;
            }

            var entity = this.state.entity;

            var attach = _.last(entity.Attachments.Items);
            var thumbnailUri = attach.ThumbnailUri.replace(/localhost/, 'localhost:8080').replace(/100/g, '50');

            var url = this.props.restApi.host + '/entity/' + entity.Id;
            var project;
            if (entity.Project) {
                project = <span className="card__project" style={{background: entity.Project.Color}}>{entity.Project.Abbreviation}</span>;
            }

            // var team;
            // if (entity.Team) {
            //     project = <span className="card__project" style={{background: entity.Project.Color}}>{entity.Project.Abbreviation}</span>;
            // }

            return (
                <div className="media card">
                    <div className="pull-left">
                        <img src={thumbnailUri} className="img-rounded media-object" />
                    </div>
                    <div className="media-body">
                        <div className="card__id"><a href={url} target="_blank">#{entity.Id}</a></div>
                        <div className="card__name">{entity.Name}</div>
                        <div className="card__info">
                            {project}
                        </div>
                    </div>
                </div>
            );
        }
    });
});
