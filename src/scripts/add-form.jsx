define(['./add-form-generated', './add-form-existing', './settings-form'], function(GeneratedForm, ExistingForm, LoginForm){

    'use strict';

    var getKey = function (v) {
        return btoa(v.name + v.title).replace(/=/g, '_');
    };

    return React.createClass({

        getInitialState: function() {
            return {
                status: 'ready',
                message: '',
                items: [
                    'userstory',
                    'bug',
                    'request'
                ],
                forms: []
            };
        },

        componentDidMount: function() {

            if (this.props.restApi.isLogged()) {
                this.getForms();
            }

            this.props.restApi.onAuth.add(function(){
                this.getForms();
            }.bind(this));

            this.props.restApi.onLogout.add(function(){
                this.forceUpdate();
            }.bind(this));
        },

        getForms: function() {
            this.props.restApi
                .getForms(this.state.items)
                .then(function(forms){
                    forms[0].active = true;
                    this.setState({
                        forms: forms
                    });
                }.bind(this))
                .done();
        },

        render: function() {

            if (!this.props.restApi.isLogged()) {
                return (<LoginForm hideResult={true} restApi={this.props.restApi} />);
            }

            return (
                <div className="add-form">
                    <div className="add-form-inner">
                        <div className="column-selector">
                            <ul className="nav nav-pills nav-stacked">
                                {this.state.forms.map(function(v){
                                    return (
                                        <li key={getKey(v)} className={v.name.toLowerCase() + (v.active ? ' active' : '')}>
                                            <a href={"#" + getKey(v)} data-toggle="tab">{v.title}</a>
                                        </li>
                                    );
                                })}
                                <li className='existing'>
                                    <a href="#existing" data-toggle="tab">Attach to...</a>
                                </li>
                            </ul>
                        </div>
                        <div className="tab-content column-forms">
                            {this.state.forms.map(function(v){
                                return (
                                    <div key={getKey(v)} className={"tab-pane " + (v.active ? 'active' : '')} id={getKey(v)}>
                                        <GeneratedForm restApi={this.props.restApi}
                                                       restId={v.name}
                                                       restTitle={v.title}
                                                       paintManager={this.props.paintManager} />
                                    </div>
                                );
                            }.bind(this))}
                            <div key='existing' className="tab-pane" id='existing'>
                                <ExistingForm restApi={this.props.restApi} paintManager={this.props.paintManager} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });
});
