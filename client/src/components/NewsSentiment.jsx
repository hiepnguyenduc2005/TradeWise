import React, { useState } from "react";
import Chart from "react-apexcharts";
import "../css/NewsData.css";

export default function NewsSentiment({ sentiment }) {
    if (!sentiment) {
        return (
            <div className="news-sentiment-container">
                <div className="sentiment-text">
                    <h5>Sentiment Score & Distribution</h5> (Preminum Only)
                </div>
            </div>
        )}
    const score = parseFloat(sentiment.sentiment_value);

    const sentimentRanges = [
        { label: "Bearish", range: [-Infinity, -0.4] },
        { label: "Somewhat-Bearish", range: [-0.4, -0.1] },
        { label: "Neutral", range: [-0.1, 0.1] },
        { label: "Somewhat-Bullish", range: [0.1, 0.4] },
        { label: "Bullish", range: [0.4, Infinity] },
    ];

    const matchedLabel = sentimentRanges.find(({ range }) => score > range[0] && score <= range[1])?.label || "Unknown";

    const chartOptions = {
        labels: Object.keys(sentiment.sentiment_labels_count),
        legend: { position: 'bottom' }
    };

    const chartSeries = Object.values(sentiment.sentiment_labels_count);

    return (
        <div className="news-sentiment-container">
            <div className="sentiment-columns">
                <div className="sentiment-text">
                    <h5>Sentiment Score</h5>
                    <p className="score-text">
                        <span className="score"><b>{score.toFixed(4)}</b></span>&nbsp;&nbsp;&nbsp;
                        {matchedLabel.includes("Bullish") 
                        ? <span className="label positive">{matchedLabel}</span>
                        : matchedLabel.includes("Bearish")
                        ? <span className="label negative">{matchedLabel}</span>
                        : <span className="label neutral">{matchedLabel}</span>
                        }
                    </p>
                    <ul>
                        {sentimentRanges.map(({ label, range }, i) => (
                            <li key={i}>
                                <b>{label}</b>: {
                                range[0] === -Infinity ? "score ≤ -0.4" :
                                range[1] === Infinity ? "score ≥ 0.4" :
                                `${range[0]} < score ≤ ${range[1]}`
                                }
                            </li>
                        ))}
                    </ul>
                </div>
        
                <div className="sentiment-chart">
                    <h5>Sentiment Distribution</h5>
                    <div className="chart">
                        <Chart options={chartOptions} series={chartSeries} type="pie" width="300" />
                    </div>
                </div>
            </div>
        </div>
    );
}
