import React, { Component } from 'react';
import classNames from 'classnames';

class UploadForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file_path: '',
            public_url: '',
            owner: '',
            mode: 'public',
            fileInputKey: Date.now(),
            message: '',
            showMessage: false,
            showLoader: false
        };
    }

    handleSubmit = (event) => {
        event.preventDefault();
        
        this.setState({ showLoader: true });
        
        const formData = new FormData();

        formData.append('public_url', this.state.public_url);
        formData.append('owner', this.state.owner);
        formData.append('mode', this.state.mode);
        formData.append('file_path', this.state.file_path);

        fetch('http://localhost:3000/', {
            method: 'POST',
            body: formData
        })
            .then(response => 
                new Promise(resolve => {
                    response
                        .text()
                        .then(message => {
                            resolve({ message, status: response.status });
                        });
                })
            )
            .then(({ message, status }) => {
                this.setState({
                    message,
                    showMessage: true,
                    showLoader: false
                });
                
                if(status === 200) {
                    this.setState({
                        file_path: '',
                        public_url: '',
                        owner: '',
                        mode: 'public',
                        fileInputKey: Date.now()
                    });
                }
        
                setTimeout(() => this.setState({ showMessage: false }), 3000);
            });
                
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.files ? 
                event.target.files[0] : 
                event.target.value 
        });
    }
    
    render() {
        return (
            <form
                onSubmit={this.handleSubmit}
                className="upload-form"
            >
                <span
                    className={classNames({
                        'upload-form__message': true,
                        'show': this.state.showMessage,
                        'hide': !this.state.showMessage
                    })}
                >
                    {this.state.message}
                </span>
                <label className="upload-form__label">Add file</label>
                <input
                    key={this.state.fileInputKey}
                    type="file"
                    onChange={this.handleChange}
                    name="file_path"
                    className="upload-form__input"
                />
                <label className="upload-form__label">File public URL</label>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.public_url}
                    name="public_url"
                    className="upload-form__input upload-form__text-input"
                />
                <label className="upload-form__label">Owner key</label>
                <input
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.owner}
                    name="owner"
                    className="upload-form__input upload-form__text-input"
                />
                <label className="upload-form__label">File mode</label>
                <select
                    onChange={this.handleChange}
                    value={this.state.mode}
                    name="mode"
                    className="upload-form__input upload-form__select-input"
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
                <span 
                    className={classNames({
                        'upload-form__loader--running': this.state.showLoader,
                        'upload-form__loader--paused': !this.state.showLoader,
                        'show': this.state.showLoader,
                        'hide': !this.state.showLoader
                    })}
                >
                    Uploading...
                </span>
                <button
                    type="submit"
                    className="upload-form__submit-button"
                >Submit</button>
            </form>
        );
    }
}

export default UploadForm;