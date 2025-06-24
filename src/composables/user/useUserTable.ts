import { ref, computed } from 'vue'
import { useUserStore } from 'src/stores/user/UserStore'
import { useRoleStore } from 'src/stores/role/RoleStore'
import { Role } from 'src/entities/role/Role'

export function useUserTable() {
  const userStore = useUserStore()
  const roleStore = useRoleStore()

  const nameFilter = ref('')
  const selectedUser = ref(null)
  const showUserDialog = ref(false)

  const pagination = ref({
    sortBy: 'id',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  const users = computed({
    get: () => userStore.currentPageUsers,
    set: (val) => {
      userStore.usersPages[userStore.pagination.currentPage] = val
      userStore.currentPageUsers = val
    }
  })

  const roleOptions = computed(() =>
    roleStore.getAllRolesAcrossPages().map((role: Role) => ({
      label: role.description,
      value: role.id
    }))
  )

  const columns = [
    {
      name: 'name',
      required: true,
      label: 'Nome completo',
      align: 'left',
      field: 'name',
      sortable: true
    },
    {
      name: 'nuit',
      required: true,
      label: 'NUIT',
      align: 'left',
      field: 'nuit',
      sortable: true
    },
    {
      name: 'username',
      required: true,
      label: 'Utilizador',
      align: 'left',
      field: 'username',
      sortable: true
    },
    {
      name: 'roles',
      required: false,
      label: 'Perfis',
      align: 'left',
      field: 'roleDescription',
      format: val => val,
      sortable: false, style: 'width: 150px;' 
    },
    {
      name: 'actions',
      align: 'center',
      label: 'Ações',
      field: 'actions',
      style: 'width: 120px;'
    }
  ]

  const fetchUsers = async (page = 0, size = 10, query = nameFilter.value) => {
    await userStore.fetchUsers({
      page,
      size,
      query,
      ignoreCache: false
    })
    pagination.value.rowsNumber = userStore.pagination.totalSize
  }

  const saveUserHandler = async (user: any) => {
    const saved = await userStore.saveUser(user)
    return saved
  }

  const handleClose = async () => {
    showUserDialog.value = false
    selectedUser.value = null
    await fetchUsers(pagination.value.page - 1, pagination.value.rowsPerPage)
  }

  const deleteUserHandler = async (uuid: string) => {
    await userStore.deleteUser(uuid)
  }

  const toggleUserStatusHandler = async (row: any) => {
    const newStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const updated = await userStore.updateUserLifeCycleStatus(row.uuid, newStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  }

  const openEditDialog = (row: any) => {
    selectedUser.value = row
    showUserDialog.value = true
  }

  const opneAddDialog = () => {
    showUserDialog.value = true
  }
  

  const handleUserSave = async (user: any) => {
    await saveUserHandler(user)
    showUserDialog.value = false
    await fetchUsers(pagination.value.page - 1, pagination.value.rowsPerPage)
  }

  return {
    nameFilter,
    pagination,
    users,
    columns,
    roleOptions,
    fetchUsers,
    saveUserHandler,
    deleteUserHandler,
    toggleUserStatusHandler,
    openEditDialog,
    opneAddDialog,
    selectedUser,
    showUserDialog,
    handleUserSave,
    handleClose
  }
}
