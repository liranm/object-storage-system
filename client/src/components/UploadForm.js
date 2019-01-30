import React, { Component } from 'react';

class UploadForm extends Component {
    constructor(props) {
        super(props);
        this.fileInput = React.createRef();
    }

    handleSubmit = (event) => {
        event.preventDefault();
        
        const formData = new FormData();

        formData.append('public_url', '/abcd/test.txt');
        formData.append('owner', '123qwea');
        formData.append('mode', 'private');
        formData.append('file_path', this.fileInput.current.files[0]);

        fetch('http://localhost:3000/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response));
    }
    
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Upload File:
                    <input type="file" ref={this.fileInput} />
                </label>
                <button type="submit">Submit</button>
            </form>
        );
    }
}

export default UploadForm;