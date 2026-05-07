import { NotesProvider } from './context/NotesContext';
import { DragStateProvider } from './context/DragStateContext';
import { Board } from './components/Board/Board';

function App() {
  return (
    <NotesProvider>
      <DragStateProvider>
        <Board />
      </DragStateProvider>
    </NotesProvider>
  );
}

export default App;
