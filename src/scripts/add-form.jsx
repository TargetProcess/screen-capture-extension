define(['./settings-form'], function(Form){
    'use strict';
    return React.createClass({

        getInitialState: function() {
            return {
                status: 'ready',
                message: '',
                projects: [],
                teams: [],
                severities: [],
                priorities: []
            };
        },

        doSend: function(e) {
            e.preventDefault();
            this.createEntity();
        },

        createEntity: function() {

            this.setState({
                status: 'pending',
                message: 'Entitis in progress!!!'
            });

            var form = this.getDOMNode();


            this.props.restApi.post('Bugs', {
                Name: form.name.value.trim(),
                Project: {
                    Id: $(form.projectId).val()
                },
                Team: {
                    Id: $(form.teamId).val()
                },
                Severity: {
                    Id: $(form.severityId).val()
                },
                Priority: {
                    Id: $(form.priorityId).val()
                }
            })
            .then(function(entity) {

                this.setState({
                    status: 'success',
                    message: 'Entitis is added'
                });

                return Q.all([entity, this.props.restApi.postAttach(entity, this.props.paintManager.canvas.toDataURL())]);
            }.bind(this))
            .spread(function(entity) {
                this.setState({
                    status: 'success',
                    message: 'Entitis is done!!!'
                });
            }.bind(this))
            .catch(function(e) {
                this.setState({
                    status: 'failure',
                    message: 'Entitis is failed'
                });
            }.bind(this));
        },

        loadFields: function(){

            if (!this.props.restApi.isLogged()) return;

            Q.all([
                this.props.restApi.get('Projects'),
                this.props.restApi.get('Teams'),
                this.props.restApi.get('Severities'),
                this.props.restApi.get('Priorities').then(function(data) {
                    return {
                        Items: data.Items.filter(function(v) {
                            return v.EntityType.Name === 'Bug';
                        })
                    };
                })
            ])
            .spread(function(projects, teams, severities, priorities) {
                this.setState({
                    'projects': projects.Items,
                    'teams': teams.Items,
                    'severities': severities.Items,
                    'priorities': priorities.Items
                });
            }.bind(this));
        },



        componentDidMount: function() {
            //this.loadFields();
        },

        render: function() {

            if (!this.props.restApi.isLogged()) {
                return (
                    <Form restApi={this.props.restApi} onLogin={this.loadFields} />
                );
            }

            var message = '';
            if (this.state.message) {
                var className = this.state.status === 'failure' ? 'danger' : 'success';
                message = <div className={"alert alert-" + className}>{this.state.message}</div>;
            }

            return (
                <form className="form-add" action="#" onSubmit={this.doSend} style={this.state.status === 'pending' ? {opacity: 0.5} : {}}>
                    {message}
                    <div className="form-group">
                        <input name="name" className="form-control" type="text" placeholder="Name" />
                    </div>
                    <div className="form-group">
                        <select name="projectId" className="form-control">
                            <option selected value={null}>No Project</option>
                            {this.state.projects.map(function(v){
                                return <option key={v.Id} value={v.Id}>{v.Name}</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <select name="teamId" className="form-control">
                            <option selected value={null}>No Team</option>
                            {this.state.teams.map(function(v){
                                return <option key={v.Id} value={v.Id}>{v.Name}</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <select name="severityId" className="form-control">
                            {this.state.severities.map(function(v){
                                return <option key={v.Id} value={v.Id}>{v.Name}</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <select name="priorityId" className="form-control">
                            {this.state.priorities.map(function(v){
                                return <option key={v.Id} value={v.Id}>{v.Name}</option>
                            })}
                        </select>
                    </div>
                    <button className="btn btn-success btn-lg btn-block" type="submit">Add</button>
                </form>
            );
        }
    });
});
