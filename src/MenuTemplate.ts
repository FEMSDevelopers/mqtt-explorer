import { Menu, app, BrowserWindow, dialog, nativeImage, MenuItemConstructorOptions } from 'electron'
import * as path from 'path'
import { isDev } from './development'

const iconPath = isDev()
  ? path.join(__dirname, '..', '..', 'res', 'icon.ico')
  : path.join(process.resourcesPath, 'icon.ico')

const applicationMenu: MenuItemConstructorOptions = {
  label: 'Application',
  submenu: [
    {
      label: 'About Application',
      click: () => {
        const version = app.getVersion()
        dialog.showMessageBox({
          icon: nativeImage.createFromPath(iconPath),
          title: 'About MQTT Explorer',
          message: `MQTT Explorer v${version}`,
          detail: [
            'Author: Thomas Nordquist',
            'License: CC-BY-ND-4.0',
            '',
            'Homepage: https://thomasnordquist.github.io/MQTT-Explorer/',
            'Issues: https://github.com/thomasnordquist/MQTT-Explorer/issues',
          ].join('\n'),
        })
      },
    },
    {
      type: 'separator' as const,
    },
    {
      label: 'Dev Tools',
      accelerator: 'CmdOrCtrl+Alt+I',
      role: 'toggleDevTools',
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit()
      },
    },
  ],
}

const editMenu: MenuItemConstructorOptions = {
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo',
    },
    {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo',
    },
    {
      type: 'separator',
    },
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut',
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy',
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste',
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectAll',
    },
  ],
}

const viewMenu: MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    {
      label: 'Default size',
      accelerator: 'CmdOrCtrl+0',
      click: () => {
        const window = BrowserWindow.getFocusedWindow()
        if (window) {
          window.webContents.setZoomFactor(1)
        }
      },
    },
    {
      label: 'Increase size',
      accelerator: 'CmdOrCtrl+Plus',
      click: () => {
        const window = BrowserWindow.getFocusedWindow()
        if (window) {
          const zoom = window.webContents.getZoomFactor()
          window.webContents.setZoomFactor(Math.min(zoom + 0.1, 2.0))
        }
      },
    },
    {
      label: 'Reduce size',
      accelerator: 'CmdOrCtrl+-',
      click: () => {
        const window = BrowserWindow.getFocusedWindow()
        if (window) {
          const zoom = window.webContents.getZoomFactor()
          window.webContents.setZoomFactor(Math.max(zoom - 0.1, 0.5))
        }
      },
    },
  ],
}

const template: any = [applicationMenu, editMenu, viewMenu]

export const menuTemplate = Menu.buildFromTemplate(template)
