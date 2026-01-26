import React from 'react'
import ScoreKeeper from './ScoreKeeper'

const App: React.FC = () => {
    return (
        <>
            <div id="referenceDrag"></div>
            <main class="table">
                <ScoreKeeper />
            </main>
        </>
    )
}

export default App
