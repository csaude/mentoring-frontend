<template>
  <div v-if="isFormDataVisible">
    <div class="q-ma-md page-container">
      <div class="page-input-container q-pa-md">
        <q-banner dense inline-actions class="text-white bg-primary q-px-md">
          Identificação da Tabela de Competências
          <template v-slot:action>
            <q-img src="~assets/mentoring.png" />
          </template>
        </q-banner>
        <div class="row q-mt-lg">
          <div class="col">
            <q-select
              class="row"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              dense
              outlined
              ref="programRef"
              :rules="[(val) => !!val || 'Por favor indicar o Programa']"
              lazy-rules
              v-model="form.programmaticArea.program"
              :options="programs"
              option-value="id"
              option-label="name"
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
          </div>
          <div class="col">
            <q-select
              class="col q-ml-md"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              dense
              outlined
              ref="programmaticAreaRef"
              :rules="[
                (val) => !!val || 'Por favor indicar a Área de Mentoria',
              ]"
              lazy-rules
              v-model="form.programmaticArea"
              :options="filterRedProgrammaticAreas"
              option-value="id"
              option-label="name"
              @filter="filterProgrammaticAreas"
              label="Área de Mentoria"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Sem Resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="row">
          <q-input
            outlined
            label="Nome"
            dense
            ref="nameRef"
            :rules="[(val) => !!val || 'Por favor indicar o Nome']"
            lazy-rules
            class="col"
            v-model="form.name"
            @update:model-value="(value) => (filter = value)"
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click="form.name = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </div>
        <div class="row">
          <q-input
            outlined
            label="Descrição"
            dense
            ref="descriptionRef"
            :rules="[(val) => !!val || 'Por favor indicar a Descrição']"
            lazy-rules
            class="col"
            v-model="form.description"
            @update:model-value="(value) => (filter = value)"
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click="form.description = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </div>
        <div class="row">
          <div class="col">
            <div class="row">
              <q-input
                class="col"
                label="Número de Observações de Consulta"
                outlined
                dense
                ref="targetPatientRef"
                :rules="[
                  (val) =>
                    !!val ||
                    'Por favor indicar o Número de Observações de Consulta',
                ]"
                lazy-rules
                v-model="form.targetPatient"
                type="number"
                :min="1"
              >
              </q-input>
              <q-input
                class="col q-ml-md"
                outlined
                label="Número de Avaliação de Fichas"
                dense
                ref="targetFileRef"
                :rules="[
                  (val) =>
                    !!val ||
                    'Por favor indicar o Número de Avaliação de Fichas',
                ]"
                lazy-rules
                v-model="form.targetFile"
                type="number"
                :min="1"
              >
              </q-input>
            </div>
          </div>
        </div>

        <div class="row q-my-sm">
          <q-space />
          <q-btn
            label="Cancelar"
            class="float-right"
            color="red"
            @click="cancel"
          />
          <q-btn
            class="float-right q-ml-md"
            type="submit"
            label="Avançar"
            color="primary"
            @click="goToFormQuestions(form)"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-if="isFormQuestionsDataVisible">
    <div class="q-ma-md page-container">
      <form @submit.prevent="submitForm" ref="myForm">
        <div class="page-input-container q-pa-md">
          <div class="q-mt-lg">
            <q-banner
              dense
              inline-actions
              class="text-white bg-primary q-px-sm"
            >
              Competências Associadas à
              <span style="color: amber-10">[{{ form.name }}]</span>
              <template v-slot:action>
                <q-btn
                  flat
                  round
                  dense
                  size="md"
                  class="q-ml-md"
                  color="white"
                  icon="add_circle"
                  @click="showAddOrRemoveQuestions = true"
                >
                  <q-tooltip class="bg-green-5"
                    >Adicionar Competências</q-tooltip
                  >
                </q-btn>
              </template>
            </q-banner>
          </div>

          <div>
            <q-table
              class="col"
              dense
              flat
              wrap-cells
              :rows="form.formQuestions"
              :columns="columns"
              row-key="uuid"
            >
              <template v-slot:no-data="{ icon, filter }">
                <div
                  class="full-width row flex-center text-primary q-gutter-sm text-body2"
                >
                  <span> Sem resultados para visualizar </span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>
              <template #header="props">
                <q-tr class="text-left bg-grey-3" :props="props">
                  <q-th style="width: 70px">{{ columns[0].label }}</q-th>
                  <q-th style="width: 110px">{{ columns[1].label }}</q-th>
                  <q-th style="width: 120px">{{ columns[2].label }}</q-th>
                  <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                  <!--                      <q-th class="col">{{ columns[4].label }}</q-th>-->
                  <!--                      <q-th style="width: 80px">{{ columns[5].label }}</q-th>-->
                </q-tr>
              </template>
              <template #body="props">
                <q-tr :props="props">
                  <!--                                <q-td key="sequence" :props="props">-->
                  <!--                                   {{ props.row.sequence }}-->
                  <!--                                </q-td>-->
                  <!--                                <q-td key="code" :props="props">-->
                  <!--                                    {{ props.row.question.code }}-->
                  <!--                                </q-td>-->
                  <q-td key="evaluationType" :props="props">
                    {{ props.row.evaluationType.description }}
                  </q-td>
                  <q-td key="questionCategory" :props="props">
                    {{ props.row.question.questionCategory.category }}
                  </q-td>
                  <q-td key="question" :props="props">
                    {{ props.row.question.question }}
                  </q-td>
                  <q-td key="options" :props="props">
                    <q-btn
                      flat
                      round
                      class=""
                      color="red"
                      icon="close"
                      @click="removeFormQuestions(props.row)"
                    >
                      <q-tooltip class="bg-green-5"
                        >Remover a Competência</q-tooltip
                      >
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>

          <div class="row q-my-sm q-mt-lg">
            <q-space />
            <q-btn
              label="Cancelar"
              class="float-right"
              color="red"
              @click="cancel"
            />
            <q-btn
              class="float-right q-ml-md"
              type="submit"
              :loading="submitLoading()"
              label="Terminar"
              color="primary"
              @click="saveOrUpdate(form)"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
  <q-dialog persistent v-model="showAddOrRemoveQuestions">
    <AddOrRemoveQuestions @close="showAddOrRemoveQuestions = false" />
  </q-dialog>
</template>
<script setup>
import { inject, ref, computed, onMounted, provide, reactive } from 'vue';
import Form from 'src/stores/model/form/Form';
import FormQuestion from 'src/stores/model/form/FormQuestion';
import Question from 'src/stores/model/question/Question';
import QuestionCategory from 'src/stores/model/question/QuestionCategory';
import EvaluationType from 'src/stores/model/question/EvaluationType';
import ResponseType from 'src/stores/model/question/ResponseType';
import ProgrammaticArea from 'src/stores/model/programmaticArea/ProgrammaticArea';
import Program from 'src/stores/model/program/Program';
import User from 'src/stores/model/user/User';
import UsersService from 'src/services/api/user/UsersService';
import programService from 'src/services/api/program/programService';
import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService';
import formService from 'src/services/api/form/formService';
import formQuestionService from 'src/services/api/form/formQuestionService';
import { useSwal } from 'src/composables/shared/dialog/dialog';

import AddOrRemoveQuestions from './AddOrRemoveQuestions.vue';

const form = ref(new Form());

form.value.programmaticArea = new ProgrammaticArea();
form.value.programmaticArea.program = new Program();

const step = inject('step');
const filterRedProgrammaticAreas = ref([]);

const emit = defineEmits(['goToFormQuestions', 'close']);
const currUser = ref(new User());

//Ref's
const programRef = ref(null);
const programmaticAreaRef = ref(null);
// const codeRef = ref(null);
const nameRef = ref(null);
const targetPatientRef = ref(null);
const targetFileRef = ref(null);
const isFormDataVisible = ref(false);
const isFormQuestionsDataVisible = ref(false);
const showAddOrRemoveQuestions = ref(false);

const searchResults = ref([]);

const addedFormQuestions = reactive(
  ref(
    new FormQuestion({
      question: new Question({
        questionCategory: new QuestionCategory(),
      }),
      evaluationType: new EvaluationType(),
      responseType: new ResponseType(),
    })
  )
);

const { alertError, alertSucess, alertWarningAction } = useSwal();

const columns = [
  // {
  //   name: 'sequence',
  //   align: 'left',
  //   label: 'Seq',
  //   field: (row) => (row.sequence),
  //   sortable: false,
  // },
  // {
  //   name: 'code',
  //   align: 'left',
  //   label: 'Código',
  //   field: (row) => (row.question.code),
  //   sortable: false,
  // },
  {
    name: 'evaluationType',
    align: 'left',
    label: 'Tipo de Avaliação',
    field: (row) => row.evaluationType,
    sortable: false,
  },
  {
    name: 'questionCategory',
    align: 'left',
    label: 'Categoria',
    field: (row) => row.question.questionCategory,
    sortable: false,
  },
  {
    name: 'question',
    align: 'left',
    label: 'Descrição',
    field: (row) => row.question,
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

// Selected Form - edition step
const selectedForm = inject('selectedForm');
const isNewForm = inject('isNewForm');

onMounted(() => {
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
  initFormData();
});

const initFormData = () => {
  if (!isNewForm.value) {
    form.value = formService.getById(selectedForm.value.id);
  }
  selectedForm.value = null;
  isFormDataVisible.value = true;
  isFormQuestionsDataVisible.value = false;
};

const programs = computed(() => {
  return programService.piniaGetAll();
});

const submitLoading = () => {
  searchResults.value = form.value.formQuestions;
};

const programmaticAreas = computed(() => {
  if (
    form.value.programmaticArea.program !== null &&
    form.value.programmaticArea.program !== undefined
  ) {
    return programmaticAreaService.getProgrammaticAreasByProgramaId(
      form.value.programmaticArea.program.id
    );
  } else {
    return null;
  }
});

const filterProgrammaticAreas = (val, update, abort) => {
  const stringOptions = programmaticAreas;
  if (val === '') {
    update(() => {
      filterRedProgrammaticAreas.value = stringOptions.value.map(
        (programmaticArea) => programmaticArea
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedProgrammaticAreas.value = [];
    });
  } else {
    update(() => {
      filterRedProgrammaticAreas.value = stringOptions.value
        .map((programmaticArea) => programmaticArea)
        .filter((programmaticArea) => {
          return (
            programmaticArea &&
            programmaticArea.name.toLowerCase().indexOf(val.toLowerCase()) !==
              -1
          );
        });
    });
  }
};

const cancel = () => {
  addedFormQuestions.value = null;
  selectedForm.value = null;
  isNewForm.value = true;
  emit('close');
};

const goToFormQuestions = (form) => {
  programRef.value.validate();
  programmaticAreaRef.value.validate();
  // codeRef.value.validate();
  nameRef.value.validate();
  targetPatientRef.value.validate();
  targetFileRef.value.validate();

  if (
    !programRef.value.hasError &&
    !programmaticAreaRef.value.hasError &&
    // !codeRef.value.hasError &&
    !nameRef.value.hasError &&
    !targetPatientRef.value.hasError &&
    !targetFileRef.value.hasError
  ) {
    const target_copy = Object.assign({}, form);
    if (!isNewForm.value) {
      searchFormQuestions(form);
    }
    addedFormQuestions.value = searchResults.value;
    isFormDataVisible.value = false;
    isFormQuestionsDataVisible.value = true;
  }
};

const searchFormQuestions = (form) => {
  const params = {
    formId: form.id,
  };
  Object.keys(params).forEach(
    (key) => params[key] === '' && delete params[key]
  );
  formQuestionService
    .search(params)
    .then((response) => {
      addedFormQuestions.value = response.data;
      addedFormQuestions.value.forEach((fQ) => {
        form.formQuestions.push(fQ);
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

const removeFormQuestions = (formQuestion) => {
  alertWarningAction('Tem certeza que deseja remover esta competência?').then(
    (result) => {
      if (result) {
        if (formQuestion.id === null) {
          form.value.formQuestions.pop(formQuestion);
        } else {
          const params = {
            userId: currUser.value.id,
            formId: form.value.id,
          };
          Object.keys(params).forEach(
            (key) => params[key] === '' && delete params[key]
          );
          formQuestionService
            .remove(params, formQuestion)
            .then((resp) => {
              const results = form.value.formQuestions.filter((fQ) => {
                return fQ.id !== formQuestion.id;
              });
              form.value.formQuestions = results;
              alertSucess('Competência removida com sucesso!');
            })
            .catch((error) => {
              console.error(error);
              alertError('Ocorreu um erro ao remover esta competência!');
              return;
            });
        }
      }
    }
  );
};

const saveOrUpdate = (form) => {
  const params = {
    userId: currUser.value.id,
  };
  Object.keys(params).forEach(
    (key) => params[key] === '' && delete params[key]
  );
  alertWarningAction('Tem certeza que deseja guardar as alterações?').then(
    (result) => {
      if (result) {
        formService
          .saveOrUpdate(form)
          .then((response) => {
            if (response.status === 201) {
              alertSucess('Tabela de Competências registada com sucesso!').then(
                (result) => {
                  if (result) {
                    emit('close');
                  }
                }
              );
              searchResults.value = form.formQuestions;
            } else {
              alertError('Não foi possivel gravar por ocorrência de um erro.');
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  );
};

provide('showAddOrRemoveQuestions', showAddOrRemoveQuestions);
provide('addedFormQuestions', addedFormQuestions);
provide('searchResults', searchResults);
provide('selectedForm', form);
</script>
<style lang="scss">
.title {
  background-color: $primary;
}
</style>
