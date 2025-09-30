<template>
  <q-page>
    <div class="q-pt-sm" style="height: 100%">
      <div class="q-ma-md q-pa-md page-container">
        <div>
          <q-table
            class="row"
            dense
            :rows="searchResults"
            :columns="columns"
            row-key="id"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 20, 50, 100]"
            :loading="loading"
            @request="onRequest"
          >
            <template v-slot:no-data="{ icon, filter }">
              <div
                class="full-width row flex-center text-primary q-gutter-sm text-body2"
              >
                <span> Sem resultados para visualizar </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="tableCode" :props="props">
                  <span
                    v-if="
                      props.row.id === null ||
                      selectedQuestion.id === props.row.id
                    "
                  >
                    <q-input
                      outlined
                      label="Código"
                      dense
                      ref="codeRef"
                      class="col q-mr-md"
                      v-model="data.tableCode"
                      style="width: 120px"
                      >
                        <template v-slot:append>
                          <q-icon
                            name="close"
                            @click="data.tableCode = ''"
                            class="cursor-pointer"
                          />
                        </template>
                    </q-input>

                  </span>
                  <span v-else> {{ props.row.tableCode }}</span>
                </q-td>
                <q-td key="question" :props="props">
                  <span
                    v-if="
                      props.row.id === null ||
                      selectedQuestion.id === props.row.id
                    "
                  >
                    <q-input
                      outlined
                      label="Competência"
                      dense
                      ref="questionRef"
                      class="col q-ml-md"
                      v-model="data.question"
                    >
                      <template v-slot:append>
                        <q-icon
                          name="close"
                          @click="data.question = ''"
                          class="cursor-pointer"
                        />
                      </template>
                    </q-input>
                  </span>
                  <span v-else>
                    {{ props.row.question }}
                  </span>
                </q-td>
                <q-td key="program" :props="props">
                  <span
                    v-if="
                      props.row.id === null ||
                      selectedQuestion.id === props.row.id
                    "
                  >
                    <q-select
                      class="col"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      dense
                      outlined
                      ref="programRef"
                      lazy-rules
                      v-model="data.program"
                      :options="programs"
                      option-value="id"
                      option-label="description"
                      label="Programa"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sem Resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </span>
                  <span v-else>
                    {{ props.row.program.description }}
                  </span>
                </q-td>
                <q-td key="options" :props="props">
                  <div class="col">
                    <span v-if="props.row.id === null">
                      <q-btn
                        @click="submitForm"
                        class="q-ml-md q-mb-xs"
                        square
                        color="primary"
                        icon="save"
                      >
                      <q-tooltip class="bg-green-5">Salvar</q-tooltip>
                    </q-btn>
                    <q-btn
                      @click="closeForm"
                      class="q-ml-md q-mb-xs"
                      square
                      color="amber"
                      icon="close"
                    >
                      <q-tooltip class="bg-amber-5">Fechar</q-tooltip>
                    </q-btn>

                    </span>
                    <span v-else>
                      <q-btn
                        v-if="selectedQuestion.id !== props.row.id"
                        flat
                        round
                        class="q-ml-md"
                        color="green-8"
                        icon="edit"
                        @click="editQuestion(props.row)"
                      >
                        <q-tooltip class="bg-green-5"
                        >Detalhar/Editar Competência</q-tooltip
                        >
                      </q-btn>
                      <q-btn
                        v-if="selectedQuestion.id === props.row.id"
                        flat
                        round
                        class="q-ml-md"
                        color="green-8"
                        icon="done"
                        @click="saveUpdate(props.row)"
                      >
                        <q-tooltip class="bg-green-5"
                        >Guardar Alteração</q-tooltip
                        >
                      </q-btn>
                      <q-btn
                        v-if="selectedQuestion.id === props.row.id"
                        flat
                        round
                        class="q-ml-md"
                        color="red-8"
                        icon="close"
                        @click="resetFields()"
                      >
                        <q-tooltip class="bg-green-5"
                        >Descartar Alteração</q-tooltip
                        >
                      </q-btn>
                      <q-btn
                        v-if="selectedQuestion.id !== props.row.id"
                        flat
                        round
                        class="q-ml-md"
                        :color="isActive(props.row) ? 'green' : 'red'"
                        icon="circle"
                        @click="confirmQuestionLifeCycleChange(props.row)"
                      >
                    <q-tooltip class="bg-green-5">{{ isActive(props.row) ? 'Inactivar Tabela de Competências' : 'Activar Tabela de Competências' }}</q-tooltip>
                  </q-btn>
                      <span
                        style="color: green"
                        v-if="used_in_form_section(props.row)"
                      >
                        Em uso
                      </span>
                      <q-btn
                        v-if="selectedQuestion.id !== props.row.id && !used_in_form_section(props.row)"
                        flat
                        round
                        class="q-ml-md"
                        color="red-8"
                        icon="delete"
                        @click="deleteQuestion(props.row.id)">
                         <q-tooltip class="bg-red-5">'Apagar Competência'</q-tooltip>
                      </q-btn>
                    </span>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>

        <q-page-sticky position="bottom-right" :offset="[20, 30]" class="row">
          <q-fab color="primary" glossy icon="add" @click="addNewRow()" />
        </q-page-sticky>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, inject, defineEmits } from 'vue';
import questionService from 'src/services/api/question/questionService';
import User from 'src/stores/model/user/User';
import UsersService from 'src/services/api/user/UsersService';
import { computed } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import useQuestion from 'src/composables/question/questionMethods';
import {Loading, QSpinnerRings} from "quasar";
import programService from "src/services/api/program/programService";

const { createQuestionFromDTO,createDTOFromQuestion } = useQuestion();

const { alertError, alertSucess, alertWarningAction } = useSwal();
const step = inject('step');
const searchResults = ref([]);
const selectedQuestion = ref('');
const openForm = ref(false);
const newRowAdded = ref(false);

const data = ref({
  tableCode: '',
  question: '',
  program: '',
});
const columns = [
  {
    name: 'tableCode',
    align: 'left',
    label: 'Código',
    sortable: false,
  },
  {
    name: 'question',
    align: 'left',
    label: 'Competência',
    sortable: false,
  },
  {
    name: 'program',
    align: 'left',
    label: 'Programa',
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const emit = defineEmits(['goToQuestioningAreas']);
const currUser = ref(new User());

const loading = ref(true);

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

onMounted(async() => {
  
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
  await search();
});

const programs = computed(() => {
  return programService.piniaGetAll();
});

const submitForm = () => {
  Loading.show({ spinner: QSpinnerRings });
  const question = {
    tableCode: data.value.tableCode,
    question: data.value.question,
    program: data.value.program,
  };

  questionService.saveQuestion(question).then((response) => {
    if(response.status === 200 || response.status === 201){
      closeForm;
      Loading.hide()
      newRowAdded.value = false;
      search()
      alertSucess('Competência registada com sucesso');
    } else {
      alertError('Ocorreu algum erro durante a operação.')
    }
  });
};

const closeForm = () => {
  data.value.tableCode = '';
  data.value.question = '';
  data.value.program = '';
  removeRow();
};

const editQuestion = (question) => {
  removeRow();
  selectedQuestion.value = question;
  data.value = question;
};

const saveUpdate = () => {
  const question = {
    id: selectedQuestion.value.id,
    tableCode: data.value.tableCode,
    question: data.value.question,
    program: data.value.program,    
  };

  questionService.updateQuestion(question).then((response) => {
    if(response.status === 200 || response.status === 201){
      resetFields();
      alertSucess('Competência actualizada com sucesso');
      search()
    } else {
      alertError('Ocorreu algum erro durante a operação.')
    }
  });
};

const resetFields = () => {
  selectedQuestion.value = {};
  data.value = { tableCode: '', question: '', program: '' };
};

const confirmQuestionLifeCycleChange = (question) => {
  let msg = question.lifeCycleStatus === 'ACTIVE'
    ? 'Confirma inactivar a competência?'
    : 'Confirma activar a competência?';

  alertWarningAction(msg).then((result) => {
    if (result) {
      changeLifeCycle(question);
    }
  });
};

const changeLifeCycle = (question) => {
  question.lifeCycleStatus = question.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  questionService
    .changeLifeCycleStatus(createDTOFromQuestion(question))
    .then((response) => {
      if(response.status === 200 || response.status === 201){
        alertSucess('Operação efectuada com sucesso');
        questionService.update(question);
      } else {
        alertError('Ocorreu algum erro durante a operação.')
      }
    })
    .catch((error) => {
      question.lifeCycleStatus = question.lifeCycleStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      console.error('Error', error.message);
      alertError('Ocorreu um erro inesperado nesta operação.');
    });
};

const isActive = (question) => question.lifeCycleStatus === 'ACTIVE';
const used_in_form_section = (question) => question.used_in_form_section === true;

const deleteQuestion = (questionId) => {
  alertWarningAction('Tem certeza que deseja apagar a competência?').then(
    (result) => {
      if (result) {
        questionService
          .deleteQuestion(questionId)
          .then((response) => {
            if (response.status === 200 || response.status === 201) {
              alertSucess('Competência apagada com sucesso!').then((result) => {
                search()
              });
            } else {
              alertError('Não foi possivel apagar a competência.');
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        console.info('OK. the Item Has not removed');
      }
    }
  );
};

const addNewRow = () => {
  resetFields();
  openForm.value = true;
  if (!newRowAdded.value) {
    newRowAdded.value = true;
    const newRow = {
      id: null,
      question: {
        tableCode: null,
        question: null,
        program: null,
      },
      acao: 'NOVA_LINHA',
    };
    searchResults.value.unshift(newRow);
  } else {
    alertError('Há uma área sendo associado.');
  }
};

const removeRow = () => {
  if (openForm.value == true) {
    const index = searchResults.value.findIndex((item) => item.id === null);
    searchResults.value.splice(index, 1);
    newRowAdded.value = false;
  }
};

const composeQuestios = (questions) => {
  searchResults.value = [];

  questions.forEach((questionObj) => {
    const question = createQuestionFromDTO(questionObj)
    searchResults.value.push(question)
  });
};

const search = async () => {
  Loading.show({ spinner: QSpinnerRings });
  const params = {
    code: '',
    description: '',
    programId: '',
    page: pagination.value.page - 1,
    size: pagination.value.rowsPerPage,
  };
  Object.keys(params).forEach(
    (key) => params[key] === '' && delete params[key]
  );
  questionService
    .search(params)
    .then((response) => {
      searchResults.value = [];
      if (response.status === 200 || (response.status === 201)) {
        if(response.data.content?.length > 0)
        composeQuestios(response.data.content)
        pagination.value.rowsNumber = response.data.totalSize; // Update rows count
      }
    Loading.hide();
  })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  // Update pagination state
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  // Fetch data based on the updated pagination
  search();
};
</script>
