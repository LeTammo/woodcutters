import React, {useState} from 'react';

function ShareLink() {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-1">
            <label htmlFor="shareLink">Share-Link:</label>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control border-dark"
                    id="shareLink"
                    value={window.location.href}
                    readOnly
                />
                <button className="btn btn-dark" id="copyButton" onClick={handleCopyLink}>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>

    );
}

export default ShareLink;