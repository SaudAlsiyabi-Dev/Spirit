/**
 * The desktop window.
 *
 * Kept deliberately plain: a borderless-capable window that loads the built
 * page off disk. There is no server and no network — the game is a folder of
 * files, which is why vite builds it with relative paths.
 */
const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('node:path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 854,
    minHeight: 480,
    backgroundColor: '#05070a',
    autoHideMenuBar: true,
    title: 'Glow',
    webPreferences: {
      // The page is ours and does nothing privileged; it needs no bridge, and
      // leaving these off is the whole of the sandboxing story here.
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  })

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  // F11 inside the page cannot resize the OS window, so it is handled here.
  globalShortcut.register('F11', () => win.setFullScreen(!win.isFullScreen()))
  return win
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => globalShortcut.unregisterAll())
