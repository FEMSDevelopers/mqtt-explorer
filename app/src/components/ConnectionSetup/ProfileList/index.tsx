import React, { useState, useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Divider, IconButton, InputAdornment, List, ListSubheader, TextField, Tooltip } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import FileUpload from '@mui/icons-material/FileUpload'
import FileDownload from '@mui/icons-material/FileDownload'
import Search from '@mui/icons-material/Search'
import Clear from '@mui/icons-material/Clear'
import ConnectionItem from './ConnectionItem'
import { AddButton } from './AddButton'
import { AppState } from '../../../reducers'
import { connectionManagerActions } from '../../../actions'
import { ConnectionOptions } from '../../../model/ConnectionOptions'
import { KeyCodes } from '../../../utils/KeyCodes'
import { useGlobalKeyEventHandler } from '../../../effects/useGlobalKeyEventHandler'

const ConnectionItemAny = ConnectionItem as any

const RECENT_COUNT = 3

interface Props {
  classes: any
  selected?: string
  connections: { [s: string]: ConnectionOptions }
  actions: typeof connectionManagerActions
}

function sortAlphabetically(a: ConnectionOptions, b: ConnectionOptions) {
  return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
}

function ProfileList(props: Props) {
  const { actions, classes, connections, selected } = props
  const [searchQuery, setSearchQuery] = useState('')

  const isSearching = searchQuery.trim().length > 0

  // Compute sections: favorites, recent, all
  const { favorites, recent, allConnections, flatList } = useMemo(() => {
    const connectionList = Object.values(connections)

    // When searching, return a flat filtered list (no sections)
    if (isSearching) {
      const query = searchQuery.toLowerCase()
      const filtered = connectionList
        .filter(
          c =>
            (c.name || '').toLowerCase().includes(query) ||
            (c.host || '').toLowerCase().includes(query)
        )
        .sort((a, b) => {
          const aFav = a.favorite ? 1 : 0
          const bFav = b.favorite ? 1 : 0
          if (aFav !== bFav) return bFav - aFav
          return sortAlphabetically(a, b)
        })
      return { favorites: [], recent: [], allConnections: [], flatList: filtered }
    }

    // Favorites: connections with favorite flag, sorted alphabetically
    const favs = connectionList.filter(c => c.favorite).sort(sortAlphabetically)
    const favIds = new Set(favs.map(c => c.id))

    // Recent: top 3 most recently used connections (excluding favorites), sorted by most recent
    const recentCandidates = connectionList
      .filter(c => !favIds.has(c.id) && c.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, RECENT_COUNT)
    const recentIds = new Set(recentCandidates.map(c => c.id))

    // All: remaining connections sorted alphabetically (excluding favorites and recent)
    const rest = connectionList
      .filter(c => !favIds.has(c.id) && !recentIds.has(c.id))
      .sort(sortAlphabetically)

    // Flat list for keyboard navigation (in display order)
    const flat = [...favs, ...recentCandidates, ...rest]

    return { favorites: favs, recent: recentCandidates, allConnections: rest, flatList: flat }
  }, [connections, searchQuery, isSearching])

  const selectConnection = (dir: 'next' | 'previous') => (event: KeyboardEvent) => {
    if (!selected) {
      return
    }
    const indexDirection = dir === 'next' ? 1 : -1
    const selectedIndex = flatList.map(connection => connection.id).indexOf(selected)
    const nextConnection = flatList[selectedIndex + indexDirection]
    if (nextConnection) {
      actions.selectConnection(nextConnection.id)
    }
    event.preventDefault()
  }

  useGlobalKeyEventHandler(KeyCodes.arrow_down, selectConnection('next'))
  useGlobalKeyEventHandler(KeyCodes.arrow_up, selectConnection('previous'))

  const createConnectionButton = (
    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
      <AddButton action={actions.createConnection} />
      <span style={{ flex: 1 }}>Connections</span>
      <Tooltip title="Import connections">
        <IconButton size="small" onClick={actions.importConnections} aria-label="Import connections">
          <FileUpload fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export connections">
        <IconButton size="small" onClick={actions.exportConnections} aria-label="Export connections">
          <FileDownload fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  )

  function renderConnectionItem(connection: ConnectionOptions) {
    return <ConnectionItemAny connection={connection} key={connection.id} selected={selected === connection.id} />
  }

  function renderSections() {
    // When searching, show flat filtered results
    if (isSearching) {
      return flatList.map(renderConnectionItem)
    }

    // No sections needed if there are no favorites and no recent
    if (favorites.length === 0 && recent.length === 0) {
      return allConnections.map(renderConnectionItem)
    }

    return (
      <>
        {favorites.length > 0 && (
          <>
            <ListSubheader className={classes.sectionHeader}>Favorites</ListSubheader>
            {favorites.map(renderConnectionItem)}
            <Divider className={classes.sectionDivider} />
          </>
        )}
        {recent.length > 0 && (
          <>
            <ListSubheader className={classes.sectionHeader}>Recent</ListSubheader>
            {recent.map(renderConnectionItem)}
            <Divider className={classes.sectionDivider} />
          </>
        )}
        {allConnections.length > 0 && (
          <>
            <ListSubheader className={classes.sectionHeader}>All</ListSubheader>
            {allConnections.map(renderConnectionItem)}
          </>
        )}
      </>
    )
  }

  return (
    <List style={{ height: '100%', display: 'flex', flexDirection: 'column' }} component="nav" subheader={createConnectionButton}>
      <div style={{ padding: '0 12px 4px' }}>
        <TextField
          size="small"
          placeholder="Search connections..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          inputProps={{ 'aria-label': 'Search connections' }}
        />
      </div>
      <div className={classes.list}>
        {renderSections()}
      </div>
    </List>
  )
}

const styles = (theme: Theme) => ({
  list: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  sectionHeader: {
    lineHeight: '32px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    paddingLeft: '16px',
  },
  sectionDivider: {
    margin: '4px 16px',
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(connectionManagerActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  connections: state.connectionManager.connections,
  selected: state.connectionManager.selected,
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProfileList) as any)
