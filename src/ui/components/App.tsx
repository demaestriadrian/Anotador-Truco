import ScoreKeeper from './ScoreKeeper'
import VictoryModal from './VictoryModal'

const App = () => {
    return (
        <>
            <div id="referenceDrag"></div>
            <main class="table">
                <ScoreKeeper />
            </main>
            <VictoryModal />
        </>
    )
}

export default App
