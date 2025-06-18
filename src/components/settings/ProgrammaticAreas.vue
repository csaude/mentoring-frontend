<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useProgrammaticAreaStore } from 'src/stores/programaticArea/ProgrammaticAreaStore'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { Program } from 'src/entities/program/Program'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const areaStore = useProgrammaticAreaStore()
const programStore = useProgramStore()

const nameFilter = ref('')

const areas = computed({
  get: () => areaStore.currentPageAreas,
  set: (val) => {
    areaStore.areasPages[areaStore.pagination.currentPage] = val
    areaStore.currentPageAreas = val
  }
})

const programOptions = computed(() => {
  return programStore.currentPagePrograms
    .filter(program => program.lifeCycleStatus === 'ACTIVE')
    .map(program => ({
      label: program.name,
      value: program.id
    }))
})

const columns = [
  { name: 'name', label: 'Nome', align: 'left', field: 'name', style: 'width: 60%; white-space: normal; word-break: break-word;' },
  { name: 'programId', label: 'Programa', align: 'left', field: 'programId' },
  { name: 'actions', label: 'Acções', align: 'center', style: 'width: 120px;' }
]

onMounted(async () => {
  if (programStore.currentPagePrograms.length === 0) {
    await programStore.fetchPrograms({ page: 0, size: 100 })
  }

  await loadAreas(0, pagination.value.rowsPerPage)
})

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

const loadAreas = async (page: number, size: number) => {
  await areaStore.fetchAreas({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })

  pagination.value.rowsNumber = areaStore.pagination.totalSize
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    areaStore.areasPages = {}
    areaStore.currentPageAreas = []
    console.log('[onRequest] RowsPerPage changed → Clearing store cache')
  }

  previousRowsPerPage.value = rowsPerPage

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  const apiPage = page - 1

  await loadAreas(apiPage, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadAreas(0, pagination.value.rowsPerPage)
}

const saveAreaHandler = async (areaData: any) => {
  try {
    const selectedProgram = programStore.currentPagePrograms.find(p => p.id === areaData.programId)

    if (!selectedProgram) {
      throw new Error(`Programa com ID ${areaData.programId} não encontrado.`)
    }

    const payloadToSave = {
      ...areaData,
      program: new Program({
        id: selectedProgram.id,
        uuid: selectedProgram.uuid
      })
    }

    delete payloadToSave.undefined
    delete payloadToSave._backup

    const saved = await areaStore.saveArea(payloadToSave)
    saved.program = selectedProgram
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar área programática')
    throw err
  }
}

const deleteAreaHandler = async (uuid: string) => {
  try {
    await areaStore.deleteArea(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar área programática')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} esta área programática?`
    )

    if (!confirm) return

    const updated = await areaStore.updateAreaLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado da área programática')
  }
}
</script>

<template>
  <EditableTable
    v-model="areas"
    title="Áreas de Mentoria"
    :columns="columns"
    :loading="areaStore.loading"
    v-model:pagination="pagination"
    :program-options="programOptions"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => saveAreaHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteAreaHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>
