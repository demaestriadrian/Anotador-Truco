import ScoreKeeper from './ScoreKeeper'
import VictoryModal from './VictoryModal'
import SettingsPanel from './settings/SettingsPanel'
import HistoryPanel from './history/HistoryPanel'
import ConfirmDialog from './ConfirmDialog'

const App = () => {
    return (
        <>
            <div id="referenceDrag"></div>
            <main class="table">
                <ScoreKeeper />
            </main>
            <VictoryModal />
            <SettingsPanel />
            <HistoryPanel />
            <ConfirmDialog />
        </>
    )
}

export default App
