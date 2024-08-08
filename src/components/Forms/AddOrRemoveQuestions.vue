<template>
  <q-card style="width: 85vw; max-width: 90vw">
    <div class="page-container">
      <div class="">
        <q-banner dense inline-actions class="text-white bg-primary q-px-md">
          Pesquisa de Competências
          <template v-slot:action>
            <q-btn
              flat
              round
              class="q-ml-md"
              color="red"
              icon="close"
              @click="showAddOrRemoveQuestions = false"
            >
              <q-tooltip class="bg-green-5">Pesquisa de Competências</q-tooltip>
            </q-btn>
          </template>
        </q-banner>
        <div class="row q-pa-md q-mt-lg">
          <q-input
            outlined
            label="Código da Competência"
            dense
            ref="recordCodeRef"
            class="col"
            v-model="searchParams.question.code"
            @update:model-value="(value) => (filter = value)"
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click="searchParams.question.code = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>

          <q-input
            outlined
            label="Descrição"
            dense
            ref="descriptionRef"
            class="col q-ml-md"
            v-model="searchParams.question.question"
            @update:model-value="(value) => (filter = value)"
          >
            <template v-slot:append>
              <q-icon
                name="close"
                @click="searchParams.question.question = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>

          <q-select
            class="col q-ml-md"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            v-model="searchParams.question.questionCategory"
            dense
            outlined
            ref="questionCategoryRef"
            :options="filterRedCategories"
            option-value="id"
            option-label="category"
            @filter="filterCategories"
            label="Categoria"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Sem Resultados
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-space />
          <q-btn
            @click="searchQuestions()"
            class="q-ml-md q-mb-xs float-right"
            square
            color="primary"
            icon="search"
          >
            <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
          </q-btn>
          <q-btn
            @click="clearSearchParams"
            class="q-ml-md q-mb-xs float-right"
            square
            color="amber"
            icon="clear"
          >
            <q-tooltip class="bg-amber-5">Limpar</q-tooltip>
          </q-btn>
        </div>

        <div class="q-mx-md">
          <q-table
            class="col"
            flat
            dense
            wrap-cells
            :rows="searchResults"
            :columns="columns"
            row-key="id"
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
                <q-th style="width: 110px">{{ columns[0].label }}</q-th>
                <q-th class="col">{{ columns[1].label }}</q-th>
                <q-th style="width: 190px">{{ columns[2].label }}</q-th>
                <q-th style="width: 190px">{{ columns[3].label }}</q-th>
                <q-th style="width: 190px">{{ columns[4].label }}</q-th>
                <q-th style="width: 70px">{{ columns[5].label }}</q-th>
              </q-tr>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="questionCategory" :props="props">{{
                  props.row.question.questionCategory.category
                }}</q-td>
                <q-td key="question" :props="props">{{
                  props.row.question.question
                }}</q-td>
                <q-td key="sequence" :props="props">
                  <q-input
                    ref="recodeCodeRef"
                    class="vertical-middle"
                    dense
                    outlined
                    disable
                    v-model="props.row.question.code"
                    :rules="[
                      (val) =>
                        !!val ||
                        'Por favor indicar a Sequência/codigo na Ficha',
                    ]"
                    lazy-rules
                    :min="1"
                  >
                  </q-input>
                </q-td>
                <q-td key="evaluationType">
                  <q-select
                    class="vertical-middle"
                    fill-input
                    input-debounce="0"
                    :disable="!props.row.selected"
                    dense
                    outlined
                    ref="evaluationTypeRef"
                    v-model="props.row.evaluationType"
                    :rules="[
                      (val) => !!val || 'Por favor indicar o Tipo de Avaliação',
                    ]"
                    lazy-rules
                    option-value="id"
                    option-label="description"
                    :options="evaluationTypes"
                  />
                </q-td>
                <q-td key="responseType">
                  <q-select
                    class="vertical-middle"
                    fill-input
                    input-debounce="0"
                    dense
                    outlined
                    :disable="!props.row.selected"
                    ref="responseTypeRef"
                    v-model="props.row.responseType"
                    :rules="[
                      (val) => !!val || 'Por favor indicar o Tipo de Resposta',
                    ]"
                    lazy-rules
                    option-value="id"
                    option-label="description"
                    :options="responseTypes"
                  />
                </q-td>
                <q-td key="options" :props="props">
                  <div class="col">
                    <q-checkbox
                      v-model="props.row.selected"
                      @click="(val) => addQuestion(props.row)"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>

        <div class="row q-ma-md">
          <q-space />
          <q-btn
            label="Cancelar"
            class="float-right"
            color="red"
            @click="showAddOrRemoveQuestions = false"
          />
          <q-btn
            class="float-right q-ml-md"
            type="submit"
            label="Adicionar Seleccionadas"
            color="primary"
            @click="addSelectedQuestions()"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { inject, ref, computed, onMounted, provide } from 'vue';
import FormQuestion from 'src/stores/model/form/FormQuestion';
import Question from 'src/stores/model/question/Question';
import QuestionCategory from 'src/stores/model/question/QuestionCategory';
import ResponseType from 'src/stores/model/question/ResponseType';
import EvaluationType from 'src/stores/model/question/EvaluationType';
import questionService from 'src/services/api/question/questionService';
import questionCategoryService from 'src/services/api/question/questionCategoryService';
import responseTypeService from 'src/services/api/question/responseTypeService';
import evaluationTypeService from 'src/services/api/question/evaluationTypeService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { Loading, QSpinnerRings } from 'quasar';

const showAddOrRemoveQuestions = inject('showAddOrRemoveQuestions');

import { v4 as uuid } from 'uuid';

const selectedForm = inject('selectedForm');

const filterRedCategories = ref([]);

const { alertError } = useSwal();

const searchParams = ref(
  new FormQuestion({
    question: new Question({
      questionCategory: new QuestionCategory(),
    }),
    evaluationType: new EvaluationType(),
  })
);

const searchResults = ref([]);

const addedFormQuestions = ref([]);

const categories = computed(() => {
  return questionCategoryService.piniaGetAll();
});

const responseTypes = computed(() => {
  return responseTypeService.piniaGetAll();
});

const evaluationTypes = computed(() => {
  return evaluationTypeService.piniaGetAll();
});

const filterCategories = (val, update, abort) => {
  const stringOptions = categories;
  if (val === '') {
    update(() => {
      filterRedCategories.value = stringOptions.value.map(
        (questionCategory) => questionCategory
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      filterRedCategories.value = [];
    });
  } else {
    update(() => {
      filterRedCategories.value = stringOptions.value
        .map((questionCategory) => questionCategory)
        .filter((questionCategory) => {
          return (
            questionCategory &&
            questionCategory.category
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

const searchQuestions = () => {
  Loading.show({
    spinner: QSpinnerRings,
  });
  const params = {
    code: searchParams.value.question.code,
    description: searchParams.value.question.question,
    categoryId:
      searchParams.value.question.questionCategory.id === undefined
        ? undefined
        : searchParams.value.question.questionCategory.id,
  };
  Object.keys(params).forEach(
    (key) => params[key] === '' && delete params[key]
  );
  questionService
    .search(params)
    .then((response) => {
      composeFormQuestions(response.data);
      Loading.hide();
    })
    .catch((error) => {
      Loading.hide();
      console.error(error);
    });
};

const columns = [
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
  {
    name: 'sequence',
    align: 'left',
    label: 'Código da Competência',
    field: (row) => row.sequence,
    sortable: false,
  },
  {
    name: 'evaluationType',
    align: 'left',
    label: 'Tipo de Avaliação',
    field: (row) => row.evaluationType,
    sortable: false,
  },
  {
    name: 'responseType',
    align: 'left',
    label: 'Tipo de Resposta',
    field: (row) => row.responseType,
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const composeFormQuestions = (questions) => {
  searchResults.value = [];
  questions.forEach((question) => {
    let myUUID = uuid();
    const fQuestion = ref(
      new FormQuestion({
        question: new Question({
          questionCategory: new QuestionCategory(),
        }),
        evaluationType: new EvaluationType(),
        responseType: new ResponseType(),
      })
    );
    fQuestion.value.uuid = myUUID;
    fQuestion.value.question = question;
    fQuestion.value.question.questionCategory = question.questionCategory;
    fQuestion.value.lifeCycleStatus = 'ACTIVE';
    searchResults.value.push(fQuestion.value);
  });
};

const addQuestion = (formQuestion) => {
  const isAlreadyAssociatedQuestion =
    selectedForm.value.formQuestions.filter(
      (val) =>
        val.question.uuid === formQuestion.question.uuid &&
        val.question.questionCategory.uuid ===
          formQuestion.question.questionCategory.uuid
    ).length > 0;

  if (isAlreadyAssociatedQuestion) {
    formQuestion.selected = false;
    alertError('Esta competência já foi associada a esta tabela!');
    return;
  }

  const exists =
    addedFormQuestions.value.filter(
      (val) =>
        val.question.uuid === formQuestion.question.uuid &&
        val.question.questionCategory.uuid ===
          formQuestion.question.questionCategory.uuid
    ).length > 0;
  if (!exists) {
    formQuestion.selected = true;
    addedFormQuestions.value.push(formQuestion);
  }
};

const addSelectedQuestions = () => {
  if (addedFormQuestions.value.length === 0) {
    alertError('Seleccione pelo menos uma questão que pretenda adicionar!');
    return;
  }
  addedFormQuestions.value.forEach((formQuestion) => {
    if (
      formQuestion.evaluationType === undefined ||
      formQuestion.evaluationType === null ||
      formQuestion.evaluationType.uuid === ''
    ) {
      alertError(
        'Indique o Tipo de Avaliação! Competencia - ' +
          formQuestion.question.code
      );
      showAddOrRemoveQuestions.value = true;
      return;
    }
    if (
      formQuestion.responseType.uuid === undefined ||
      formQuestion.responseType.uuid === null ||
      formQuestion.responseType.uuid === ''
    ) {
      alertError(
        'Indique o Tipo de Resposta! Competencia - ' +
          formQuestion.question.code
      );
      showAddOrRemoveQuestions.value = true;
      return;
    }
    selectedForm.value.formQuestions.push(formQuestion);
  });
  showAddOrRemoveQuestions.value = false;
};

const clearSearchParams = () => {
  searchResults.value.length = 0;
};
</script>

<style lang="scss">
.title {
  background-color: $primary;
}
</style>
