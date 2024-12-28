import React, { createContext, useContext, useState } from 'react'

interface FileSystemContextType {
  currentDirectory: string
  executeCommand: (command: string) => string[]
  getFileContent: (filename: string) => string | null
  updateFileContent: (filename: string, content: string) => void
  openFile: (filename: string) => boolean
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}

interface FileSystemNode {
  name: string
  type: 'file' | 'directory'
  content?: string
  children?: { [key: string]: FileSystemNode }
}

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<FileSystemNode>({
    name: '/',
    type: 'directory',
    children: {},
  })
  const [currentDirectory, setCurrentDirectory] = useState('/')
  const [openedFile, setOpenedFile] = useState<string | null>(null)

  const executeCommand = (command: string): string[] => {
    const [cmd, ...args] = command.split(' ')

    switch (cmd) {
      case 'ls':
        return listDirectory()
      case 'cd':
        return [changeDirectory(args[0])]
      case 'mkdir':
        return [createDirectory(args[0])]
      case 'touch':
        return [createFile(args[0])]
      case 'open':
        return [openFileCommand(args[0])]
      case 'rmdir':
        return [removeDirectory(args[0])]
      case 'rm':
        return [removeFile(args[0])]
      case 'pwd':
        return [printWorkingDirectory()]
      case 'mv':
        return [moveFileOrDirectory(args[0], args[1])]
      case 'rename':
        return [renameFileOrDirectory(args[0], args[1])]
      case 'clear':
      case 'cls':
        return ['clear']
      case 'help':
        return helpCommand()
      default:
        return [`Command not found: ${cmd}`]
    }
  }

  const listDirectory = (): string[] => {
    const currentNode = getNodeAtPath(currentDirectory)
    if (currentNode && currentNode.type === 'directory') {
      const files = Object.entries(currentNode.children || {})
      if (files.length === 0) return ['Directory is empty']
    
      const output = ['Type       Name            Size       Modified']
      files.forEach(([name, node]) => {
        const type = node.type === 'directory' ? 'Directory' : 'File'
        const size = node.type === 'file' ? `${node.content?.length || 0} bytes` : '-'
        const modified = new Date().toLocaleString() // In a real system, this would be the actual modification date
        output.push(`${type.padEnd(10)}${name.padEnd(16)}${size.padEnd(11)}${modified}`)
      })
      return output
    }
    return ['Error: Not a directory']
  }

  const changeDirectory = (path: string): string => {
    if (path === '..') {
      const parentPath = currentDirectory.split('/').slice(0, -1).join('/')
      setCurrentDirectory(parentPath || '/')
      return ''
    }

    const newPath = `${currentDirectory}/${path}`.replace(/\/+/g, '/')
    const node = getNodeAtPath(newPath)

    if (node && node.type === 'directory') {
      setCurrentDirectory(newPath)
      return ''
    }
    return 'Error: Directory not found'
  }

  const createDirectory = (name: string): string => {
    return createNode(name, 'directory')
  }

  const createFile = (name: string): string => {
    return createNode(name, 'file')
  }

  const createNode = (name: string, type: 'file' | 'directory'): string => {
    const currentNode = getNodeAtPath(currentDirectory)
    if (currentNode && currentNode.type === 'directory') {
      if (currentNode.children && currentNode.children[name]) {
        return `Error: ${type === 'file' ? 'File' : 'Directory'} already exists`
      }
      setFileSystem((prev) => {
        const newFileSystem = { ...prev }
        const newNode: FileSystemNode = { name, type }
        if (type === 'directory') {
          newNode.children = {}
        } else {
          newNode.content = ''
        }
        const currentNodeInNewFS = getNodeAtPath(currentDirectory, newFileSystem)
        if (currentNodeInNewFS && currentNodeInNewFS.type === 'directory') {
          currentNodeInNewFS.children = { ...(currentNodeInNewFS.children || {}), [name]: newNode }
        }
        return newFileSystem
      })
      return `${type === 'file' ? 'File' : 'Directory'} created: ${name}`
    }
    return 'Error: Cannot create in this location'
  }

  const getNodeAtPath = (path: string, root: FileSystemNode = fileSystem): FileSystemNode | undefined => {
    const parts = path.split('/').filter(Boolean)
    let current: FileSystemNode | undefined = root

    for (const part of parts) {
      if (current && current.type === 'directory' && current.children) {
        current = current.children[part]
      } else {
        return undefined
      }
    }

    return current
  }

  const getFileContent = (filename: string): string | null => {
    const filePath = `${currentDirectory}/${filename}`.replace(/\/+/g, '/')
    const fileNode = getNodeAtPath(filePath)
    if (fileNode && fileNode.type === 'file') {
      return fileNode.content || ''
    }
    return null
  }

  const updateFileContent = (filename: string, content: string) => {
    const filePath = `${currentDirectory}/${filename}`.replace(/\/+/g, '/')
    setFileSystem((prev) => {
      const newFileSystem = { ...prev }
      const fileNode = getNodeAtPath(filePath, newFileSystem)
      if (fileNode && fileNode.type === 'file') {
        fileNode.content = content
      }
      return newFileSystem
    })
  }

  const openFileCommand = (filename: string): string => {
    const filePath = `${currentDirectory}/${filename}`.replace(/\/+/g, '/')
    const fileNode = getNodeAtPath(filePath)
    if (fileNode && fileNode.type === 'file') {
      setOpenedFile(filename)
      return `Opening ${filename}`
    }
    return `Error: File not found: ${filename}`
  }

  const openFile = (filename: string): boolean => {
    const filePath = `${currentDirectory}/${filename}`.replace(/\/+/g, '/')
    const fileNode = getNodeAtPath(filePath)
    if (fileNode && fileNode.type === 'file') {
      setOpenedFile(filename)
      return true
    }
    return false
  }

  const removeDirectory = (name: string): string => {
    return removeNode(name, 'directory')
  }

  const removeFile = (name: string): string => {
    return removeNode(name, 'file')
  }

  const removeNode = (name: string, type: 'file' | 'directory'): string => {
    const currentNode = getNodeAtPath(currentDirectory)
    if (currentNode && currentNode.type === 'directory' && currentNode.children) {
      const nodeToRemove = currentNode.children[name]
      if (!nodeToRemove) {
        return `Error: ${type === 'file' ? 'File' : 'Directory'} not found`
      }
      if (type === 'directory' && nodeToRemove.type === 'directory' && Object.keys(nodeToRemove.children || {}).length > 0) {
        return 'Error: Directory is not empty'
      }
      setFileSystem((prev) => {
        const newFileSystem = { ...prev }
        const currentNodeInNewFS = getNodeAtPath(currentDirectory, newFileSystem)
        if (currentNodeInNewFS && currentNodeInNewFS.type === 'directory' && currentNodeInNewFS.children) {
          delete currentNodeInNewFS.children[name]
        }
        return newFileSystem
      })
      return `${type === 'file' ? 'File' : 'Directory'} removed: ${name}`
    }
    return 'Error: Cannot remove from this location'
  }

  const printWorkingDirectory = (): string => {
    return currentDirectory
  }

  const moveFileOrDirectory = (source: string, destination: string): string => {
    const sourcePath = `${currentDirectory}/${source}`.replace(/\/+/g, '/')
    const destinationPath = `${currentDirectory}/${destination}`.replace(/\/+/g, '/')
    
    const sourceNode = getNodeAtPath(sourcePath)
    if (!sourceNode) {
      return `Error: Source not found: ${source}`
    }

    const destinationParentPath = destinationPath.split('/').slice(0, -1).join('/')
    const destinationParentNode = getNodeAtPath(destinationParentPath)
    if (!destinationParentNode || destinationParentNode.type !== 'directory') {
      return `Error: Destination directory not found: ${destinationParentPath}`
    }

    setFileSystem((prev) => {
      const newFileSystem = { ...prev }
      const sourceParentPath = sourcePath.split('/').slice(0, -1).join('/')
      const sourceParentNode = getNodeAtPath(sourceParentPath, newFileSystem)
      const destinationParentNode = getNodeAtPath(destinationParentPath, newFileSystem)

      if (sourceParentNode && sourceParentNode.type === 'directory' && sourceParentNode.children &&
          destinationParentNode && destinationParentNode.type === 'directory') {
        const movedNode = sourceParentNode.children[source]
        delete sourceParentNode.children[source]
        destinationParentNode.children = { ...(destinationParentNode.children || {}), [destination.split('/').pop()!]: movedNode }
      }

      return newFileSystem
    })

    return `Moved ${source} to ${destination}`
  }

  const renameFileOrDirectory = (oldName: string, newName: string): string => {
    const currentNode = getNodeAtPath(currentDirectory)
    if (currentNode && currentNode.type === 'directory' && currentNode.children) {
      const nodeToRename = currentNode.children[oldName]
      if (!nodeToRename) {
        return `Error: ${oldName} not found`
      }
      if (currentNode.children[newName]) {
        return `Error: ${newName} already exists`
      }
      setFileSystem((prev) => {
        const newFileSystem = { ...prev }
        const currentNodeInNewFS = getNodeAtPath(currentDirectory, newFileSystem)
        if (currentNodeInNewFS && currentNodeInNewFS.type === 'directory' && currentNodeInNewFS.children) {
          currentNodeInNewFS.children[newName] = { ...nodeToRename, name: newName }
          delete currentNodeInNewFS.children[oldName]
        }
        return newFileSystem
      })
      return `Renamed ${oldName} to ${newName}`
    }
    return 'Error: Cannot rename in this location'
  }

  const helpCommand = (): string[] => {
    const commands = [
      ['ls', 'List directory contents'],
      ['cd', 'Change the current directory'],
      ['mkdir', 'Create a new directory'],
      ['touch', 'Create a new file'],
      ['open', 'Open a file in the notepad'],
      ['rmdir', 'Remove an empty directory'],
      ['rm', 'Remove a file'],
      ['pwd', 'Print working directory'],
      ['mv', 'Move a file or directory'],
      ['rename', 'Rename a file or directory'],
      ['clear/cls', 'Clear the terminal screen'],
      ['help', 'Display this help message']
    ]

    const output = ['Command     Description']
    commands.forEach(([cmd, desc]) => {
      output.push(`${cmd.padEnd(12)}${desc}`)
    })

    return output
  }

  return (
    <FileSystemContext.Provider value={{ currentDirectory, executeCommand, getFileContent, updateFileContent, openFile }}>
      {children}
    </FileSystemContext.Provider>
  )
}

