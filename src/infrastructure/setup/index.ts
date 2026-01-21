import { GameService } from '../../core/application/services/GameService';
import { ViewAdapter } from '../adapters/view/ViewAdapter';
import { initView } from '@/ui/index'; // The original view init

export const bootstrap = async () => {
    // 1. Initialize the existing visual system
    await initView();

    // 2. Create the Adapter (Implementation of IGameView)
    const viewAdapter = new ViewAdapter();

    // 3. Create the Service (Application Layer) injected with the View Adapter
    const gameService = new GameService(viewAdapter);

    // 4. Bind View triggers to Service actions
    viewAdapter.bindAddPoints(
        () => gameService.addPoints('team_a', 1),
        () => gameService.addPoints('team_b', 1)
    );

    viewAdapter.bindNameChanges(
        (name) => gameService.changeTeamName('team_a', name),
        (name) => gameService.changeTeamName('team_b', name)
    );

    // Expose for debugging if needed
    (window as any).gameService = gameService;

    console.log('Hexagonal Architecture Bootstrapped!');
};
