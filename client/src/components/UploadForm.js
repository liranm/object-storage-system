import React, { Component } from 'react';

class UploadForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file_path: '',
            public_url: '',
            owner: '',
            mode: 'public',
            fileInputKey: Date.now()
        };
    }

    handleSubmit = (event) => {
        event.preventDefault();
        
        const formData = new FormData();

        formData.append('public_url', this.state.public_url);
        formData.append('owner', this.state.owner);
        formData.append('mode', this.state.mode);
        formData.append('file_path', this.state.file_path);

        fetch('http://localhost:3000/', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .catch(error => console.error('Error:', error))
            .then(response => {
                console.log('Success:', response);
                this.setState({
                    file_path: '',
                    public_url: '',
                    owner: '',
                    mode: 'public',
                    fileInputKey: Date.now()
                });
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
            <form onSubmit={this.handleSubmit}>
                <label>
                    Upload file:
                    <input
                        key={this.state.fileInputKey}
                        type="file"
                        onChange={this.handleChange}
                        name="file_path"
                    />
                </label>
                <label>
                    File path:
                    <input
                        type="text"
                        onChange={this.handleChange}
                        value={this.state.public_url}
                        name="public_url"
                    />
                </label>
                <label>
                    Owner key:
                    <input
                        type="text"
                        onChange={this.handleChange}
                        value={this.state.owner}
                        name="owner"
                    />
                </label>
                <label>
                    File mode:
                    <select
                        onChange={this.handleChange}
                        value={this.state.mode}
                        name="mode"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </label>
                <button type="submit">Submit</button>
            </form>
        );
    }
}

export default UploadForm;