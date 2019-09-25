import React from "react";

class Onboarding extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: 0,
            scienceFiction: false,
            historicalNovel: false,
            workout: false,
            jogging: false,
            homework: false,
            preview: false,
            emptyMind: false,
            nightclub: false,
            karaoke: false,
            bar: false,
            shopGirl: false,
            dinnerFriend: false,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <div className="root">
                <div className="categoryContainer">
                    <h1 style={{ color: 'white' }}>Welcome to Digital Nudges</h1>
                    <h4 style={{ color: 'white' }}>We want to know more about you, pick up anything you are interested with</h4>
                    <div className="categoryRow">
                        <div className="categoryCard" onMouseEnter={() => { this.setState({ hover: 1 }) }} onMouseLeave={() => { this.setState({ hover: 0 }) }}>
                            {this.state.hover === 1 ?
                                <div className="subCategoryContainer">
                                    <span><input name="scienceFiction" type="checkbox" checked={this.state.scienceFiction} onClick={this.handleInputChange} /> Science Fiction</span>
                                    <span><input name="historicalNovel" type="checkbox" checked={this.state.historicalNovel} onClick={this.handleInputChange} /> Historical Novel</span>
                                </div>
                                :
                                <h2>Reading</h2>
                            }
                        </div>
                        <div className="categoryCard" onMouseEnter={() => { this.setState({ hover: 2 }) }} onMouseLeave={() => { this.setState({ hover: 0 }) }}>
                            {this.state.hover === 2 ?
                                <div className="subCategoryContainer">
                                    <span><input name="workout" type="checkbox" checked={this.state.workout} onClick={this.handleInputChange} /> Work out</span>
                                    <span><input name="jogging" type="checkbox" checked={this.state.jogging} onClick={this.handleInputChange} /> Jogging</span>
                                </div>
                                :
                                <h2>Exercising</h2>
                            }
                        </div>
                        <div className="categoryCard" onMouseEnter={() => { this.setState({ hover: 3 }) }} onMouseLeave={() => { this.setState({ hover: 0 }) }}>
                            {this.state.hover === 3 ?
                                <div className="subCategoryContainer">
                                    <span><input name="homework" type="checkbox" checked={this.state.homework} onClick={this.handleInputChange} /> Do homework</span>
                                    <span><input name="preview" type="checkbox" checked={this.state.preview} onClick={this.handleInputChange} /> Preview material</span>
                                </div>
                                :
                                <h2>Academic</h2>
                            }
                        </div>
                    </div>
                    <div className="categoryRow">
                        <div className="categoryCard" onMouseEnter={() => { this.setState({ hover: 4 }) }} onMouseLeave={() => { this.setState({ hover: 0 }) }}>
                            {this.state.hover === 4 ?
                                <div className="subCategoryContainer">
                                    <span><input name="emptyMind" type="checkbox" checked={this.state.emptyMind} onClick={this.handleInputChange} /> Empty your mind</span>
                                </div>
                                :
                                <h2>Meditation</h2>
                            }
                        </div>
                        <div className="categoryCard" onMouseEnter={() => { this.setState({ hover: 5 }) }} onMouseLeave={() => { this.setState({ hover: 0 }) }}>
                            {this.state.hover === 5 ?
                                <div className="subCategoryContainer">
                                    <span><input name="nightclub" type="checkbox" checked={this.state.nightclub} onClick={this.handleInputChange} /> Nightclub</span>
                                    <span><input name="karaoke" type="checkbox" checked={this.state.karaoke} onClick={this.handleInputChange} /> Karaoke</span>
                                    <span><input name="bar" type="checkbox" checked={this.state.bar} onClick={this.handleInputChange} /> Bar</span>
                                </div>
                                :
                                <h2>Time for Hobbies</h2>
                            }
                        </div>
                        <div className="categoryCard" onMouseEnter={() => { this.setState({ hover: 6 }) }} onMouseLeave={() => { this.setState({ hover: 0 }) }}>
                            {this.state.hover === 6 ?
                                <div className="subCategoryContainer">
                                    <span><input name="shopGirl" type="checkbox" checked={this.state.shopGirl} onClick={this.handleInputChange} /> Shopping with girlfriend</span>
                                    <span><input name="dinnerFriend" type="checkbox" checked={this.state.dinnerFriend} onClick={this.handleInputChange} /> Have dinner with friends</span>
                                </div>
                                :
                                <h2>Social</h2>
                            }
                        </div>
                    </div>
                    <div className="onboardingBtn">Next Step</div>
                </div>
            </div>
        );
    }
}

export default Onboarding;