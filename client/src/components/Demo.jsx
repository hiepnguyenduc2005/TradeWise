import '../css/Chatbot.css';

export default function Demo() {
    return (
        <div className="chatbot-container">
            <h2 className="chatbot-header">Demo</h2>
            <div className="chatbot-messages">
                <p>Watch the demo video below and follow the instructions:</p>
                <div className="video-container">
                    <iframe
                        width="100%"
                        height="315px"
                        src="https://www.youtube.com/embed/Gcb93llG8d0"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
