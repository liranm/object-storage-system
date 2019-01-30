import React, { Component } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';

class App extends Component {
  render() {
    return (
      <div className="App">
        <section className="App-content">
          <UploadForm/>
        </section>
      </div>
    );
  }
}

export default App;
