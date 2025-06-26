<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useQuestionStore } from 'src/stores/question/QuestionStore'
import { useProgramStore } from 'src/stores/program/ProgramStore'
import { useSwal } from 'src/composables/shared/dialog/dialog'
import { useApiErrorHandler } from 'src/composables/shared/error/useApiErrorHandler'
import { Program } from 'src/entities/program/Program'

const { alertError, alertWarningAction } = useSwal()
const { handleApiError } = useApiErrorHandler()

const questionStore = useQuestionStore()
const programStore = useProgramStore()

const nameFilter = ref('')

const questions = computed({
  get: () => questionStore.currentPageQuestions,
  set: (val) => {
    questionStore.questionsPages[questionStore.pagination.currentPage] = val
    questionStore.currentPageQuestions = val
  }
})

const programOptions = computed(() =>
  programStore.currentPagePrograms
    .filter(p => p.lifeCycleStatus === 'ACTIVE')
    .map(p => ({ label: p.name, value: p.id }))
)

const columns = [
  { name: 'tableCode', label: 'Código', align: 'left', field: 'tableCode', style: 'width: 70px;' },
  { name: 'question', label: 'Competência', align: 'left', field: 'question', style: 'width: 70%; white-space: normal; word-break: break-word;' },
  { name: 'programId', label: 'Programa', align: 'left', field: 'programId' },
  { name: 'actions', label: 'Ações', align: 'center', style: 'width: 120px;' }
]

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const previousRowsPerPage = ref(pagination.value.rowsPerPage)

onMounted(async () => {
  if (programStore.currentPagePrograms.length === 0) {
    await programStore.fetchPrograms({ page: 0, size: 100 })
  }
  await loadQuestions(0, pagination.value.rowsPerPage)
})

const loadQuestions = async (page: number, size: number) => {
  await questionStore.fetchQuestions({
    page,
    size,
    name: nameFilter.value,
    ignoreCache: false
  })

  pagination.value.rowsNumber = questionStore.pagination.totalSize
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  const rowsPerPageChanged = rowsPerPage !== previousRowsPerPage.value

  if (rowsPerPageChanged) {
    questionStore.questionsPages = {}
    questionStore.currentPageQuestions = []
  }

  previousRowsPerPage.value = rowsPerPage

  pagination.value = { page, rowsPerPage, sortBy, descending, rowsNumber: pagination.value.rowsNumber }

  await loadQuestions(page - 1, rowsPerPage)
}

const onSearch = async (name: string) => {
  nameFilter.value = name
  pagination.value.page = 1
  await loadQuestions(0, pagination.value.rowsPerPage)
}

const saveQuestionHandler = async (questionData: any) => {
  try {
    const selectedProgram = programStore.currentPagePrograms.find(p => p.id === questionData.programId)
    if (!selectedProgram) throw new Error(`Programa com ID ${questionData.programId} não encontrado.`)

    const payload = {
      ...questionData,
      program: new Program({ id: selectedProgram.id, uuid: selectedProgram.uuid })
    }

    delete payload._backup
    const saved = await questionStore.saveQuestion(payload)
    saved.program = selectedProgram
    return saved
  } catch (err: any) {
    handleApiError(err, 'Erro ao salvar competência')
    throw err
  }
}

const deleteQuestionHandler = async (uuid: string) => {
  try {
    await questionStore.deleteQuestion(uuid)
  } catch (err: any) {
    handleApiError(err, 'Erro ao apagar competência')
    throw err
  }
}

const toggleStatusHandler = async (row: any) => {
  try {
    const novoStatus = row.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const confirm = await alertWarningAction(
      `Deseja realmente ${novoStatus === 'ACTIVE' ? 'ativar' : 'desativar'} esta competência?`
    )

    if (!confirm) return

    const updated = await questionStore.updateQuestionLifeCycleStatus(row.uuid, novoStatus)
    row.lifeCycleStatus = updated.lifeCycleStatus
  } catch (err: any) {
    handleApiError(err, 'Erro ao atualizar estado da competência')
  }
}
</script>

<template>
  <EditableTable
    v-model="questions"
    title="Competências"
    :columns="columns"
    :loading="questionStore.loading"
    v-model:pagination="pagination"
    :program-options="programOptions"
    :rows-per-page-options="[10, 20, 50, 100]"
    :confirm-error="alertError"
    :confirm-delete="alertWarningAction"
    @save="(row, { resolve, reject }) => saveQuestionHandler(row).then(resolve).catch(reject)"
    @delete="(row, { resolve, reject }) => deleteQuestionHandler(row.uuid).then(resolve).catch(reject)"
    @search="onSearch"
    @toggle-status="toggleStatusHandler"
    @request="onRequest"
  />
</template>
