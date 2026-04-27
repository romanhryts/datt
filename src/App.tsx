import { NotesProvider } from './context/NotesContext';
import { Board } from './components/Board/Board';

function App() {
  return (
    <NotesProvider>
      <Board />
    </NotesProvider>
  );
}

export default App;
