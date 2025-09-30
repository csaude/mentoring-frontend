<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const programStore = useProgramStore()
const nameFilter = ref('')

const programs = computed({
  get: () => programStore.currentPagePrograms,
  set: (val) => {
    programStore.programsPages[programStore.pagination.currentPage] = val
    programStore.currentPagePrograms = val
  }
})

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name', style: 'width: 30%; white-space: normal; word-break: break-word;' },
  { name: 'description', label: 'Descrição', align: 'left', field: 'description', style: 'width: 50%; white-space: normal; word-break: break-word;' },
  { name: 'actions', label: 'Acções', align: 'center', style: 'width: 120px;' }
]

onMounted(async () => {
  await loadPrograms(0, pagination.value.rowsPerPage)
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

const loadPrograms = async (page: number, size: number) => {
  await programStore.fetchPrograms({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })

  pagination.value.rowsNumber = programStore.pagination.totalSize
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    programStore.programsPages = {}
    programStore.currentPagePrograms = []
    console.log('[onRequest] RowsPerPage changed → Clearing store cache')
  }

  previousRowsPerPage.value = rowsPerPage

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  const apiPage = page - 1
  await loadPrograms(apiPage, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadPrograms(0, pagination.value.rowsPerPage)
}

const saveProgramHandler = async (programData: any) => {
  try {
    return await programStore.saveProgram(programData)
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar programa')
    throw err
  }
}

const deleteProgramHandler = async (uuid: string) => {
  try {
    await programStore.deleteProgram(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar programa')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} este programa?`
    )

    if (!confirm) return

    const updated = await programStore.updateProgramLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado do programa')
  }
}
</script>

<template>
  <EditableTable
    v-model="programs"
    title="Programas"
    :columns="columns"
    :loading="programStore.loading"
    v-model:pagination="pagination"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => saveProgramHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteProgramHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>
