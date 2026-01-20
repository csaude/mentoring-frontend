<template>
  <div class="q-pt-sm" style="height: 100%">
    <div class="q-ma-md q-pa-md page-container">
      <div class="row">
        <q-file
          v-model="file"
          outlined
          label="Seleccione o Ficheiro"
          accept=".xls,.xlsx"
          counter
          dense
          class="col-3"
          ref="fileRef"
          :rules="[(val) => !!val || 'Por favor indicar o ficheiro.']"
          @update:model-value="excelExport"
          :disable="submitSend"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
          <template v-if="file" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="file = null"
              class="cursor-pointer"
            />
          </template>
        </q-file>
        <q-select
          class="col q-ml-md"
          dense
          outlined
          ref="selectedSheetRef"
          :rules="[(val) => !!val || 'Por favor indicar a planilha.']"
          v-model="selectedSheet"
          :options="sheets"
          label="Planilha"
          :disable="submitSend"
        >
          <template v-if="selectedSheet" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="selectedSheet = null"
              class="cursor-pointer"
            />
          </template>
        </q-select>
        <q-btn
          class="q-ml-md q-mb-xs float-right"
          square
          @click="cleanForm"
          color="amber"
          icon="clear"
        >
          <q-tooltip class="bg-amber-5">Limpar</q-tooltip>
        </q-btn>

        <q-btn
          unelevated
          color="primary"
          dense
          label="Carregar"
          class="all-pointer-events q-ml-md q-mb-xs float-right"
          :loading="submitLoading"
          :disable="submitSend"
          @click="loadList()"
        >
          <q-tooltip class="bg-primary-5">Carregar</q-tooltip>
        </q-btn>
      </div>
      <div class="q-mt-lg q-mb-md">
        <div class="row items-center q-mb-md">
          <q-icon name="cloud_upload" size="sm" />
          <span class="q-pl-sm text-subtitle2">Resultado da Importação</span>
        </div>
        <q-separator color="grey-13" size="1px" />
      </div>
      <div class="col q-mb-sm">
        <span
          ><b>{{ totalImported }}</b> Mentor(es) Importado(s) com sucesso.</span
        >
      </div>
      <div class="col q-mb-xs text-red">
        <span
          ><b>{{ totalNotImported }}</b> Mentor(es) Nao Importado(s).</span
        >
      </div>
      <div>
        <q-table
          class="col"
          dense
          :rows="importResults"
          :columns="columns"
          row-key="id"
          :filter="filter"
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
              <q-td key="nuit" :props="props">
                {{ props.row.nuit }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="erro" :props="props">
                {{ props.row.erro }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <div class="row q-pt-md">
        <q-space />
        <q-btn label="Fechar" class="float-right" color="red" @click="close" />
      </div>
    </div>
  </div>
</template>
<script setup>
import * as XLSX from 'xlsx';
import useEmployee from 'src/composables/employee/employeeMethods';
import useMentor from 'src/composables/mentor/mentorMethods';
import Mentor from 'src/stores/model/mentor/Mentor';
import Employee from 'src/stores/model/employee/Employee';
import User from 'src/stores/model/user/User';
import { onMounted, ref, toRaw, inject } from 'vue';
import UsersService from 'src/services/api/user/UsersService';
import programService from 'src/services/api/program/programService';
import programmaticAreaService from 'src/services/api/programmaticArea/programmaticAreaService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import districtService from 'src/services/api/district/districtService';
import provinceService from 'src/services/api/province/provinceService';
import healthFacilityService from 'src/services/api/healthfacility/healthFacilityService';
import Location from 'stores/model/location/Location';
import partnerService from 'src/services/api/partner/partnerService';
import professionalCategoryService from 'src/services/api/professionalcategory/professionalCategoryService';
import employeeService from 'src/services/api/employee/employeeService';
import TutorProgrammaticArea from 'stores/model/tutorProgrammaticArea/TutorProgrammaticArea';
import mentorService from 'src/services/api/mentor/mentorService';
import { v4 as uuidv4 } from 'uuid';
import { useLoading } from 'src/composables/shared/loading/loading';

const { alertError, alertSucess, alertWarningAction, alertInfo } = useSwal();

const searchParams = ref(
  new Mentor({
    employee: new Employee(),
  })
);
const { fullName } = useEmployee();
const { createDTOFromMentor } = useMentor();
const fileRef = ref(null);
const importResults = ref([]);
const selectedMentor = ref('');
const selectedSheet = ref('');
const selectedSheetRef = ref(null);
const totalImported = ref(0);
const totalNotImported = ref(0);
const columns = [
  {
    name: 'nuit',
    align: 'left',
    label: 'NUIT',
    sortable: false,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    sortable: false,
  },
  { name: 'erro', align: 'left', label: 'Erro', sortable: false },
];

const emit = defineEmits(['goToMentoringAreas', 'close']);
const currUser = ref(new User());
const submitSend = ref(false);
const file = ref(null);
const selectedFile = ref('');
const sheets = ref([]);
const submitLoading = ref(false);
const selectedList = ref([]);
const loadedList = ref([]);

onMounted(async () => {
  useLoading().showloading();
  await programService.getAll();
  await districtService.getAll();
  await healthFacilityService.getAll();
  await programmaticAreaService.getAll();
  await professionalCategoryService.getAll();
  useLoading().closeLoading();
  currUser.value = JSON.parse(JSON.stringify(UsersService.getLogedUser()));
});

const editMentor = (mentor) => {
  selectedMentor.value = mentor;
};
const cleanForm = () => {
  submitLoading.value = false;
  submitSend.value = false;
  file.value = null;
  selectedFile.value = null;
  selectedSheet.value = null;
  sheets.value = [];
  importResults.value = [];
  totalImported.value = 0;
  totalNotImported.value = 0;
};

const loadList = () => {
  importResults.value = [];
  totalImported.value = 0;
  totalNotImported.value = 0;
  //--
  submitLoading.value = true;
  fileRef.value.validate();
  selectedSheetRef.value.validate();

  if (!fileRef.value.hasError && !selectedSheetRef.value.hasError) {
    selectedList.value = [];
    loadedList.value = [];
    const worksheet = selectedFile.value.Sheets[selectedSheet.value];
    let range = XLSX.utils.decode_range(worksheet['!ref']);

    range.s.r = 0;
    worksheet['!ref'] = XLSX.utils.encode_range(range);
    const rowsFromFile = XLSX.utils.sheet_to_json(worksheet, {
      range: range,
      raw: false,
      defval: '',
    });

    rowsFromFile.forEach(async (element) => {
      // showloading();
      // const keepGoing = true
      startComposingMentor(element);
    });

    submitLoading.value = false;
  } else {
    alertError('Todos os campos à vemelho devem ser preenchidos');
    submitLoading.value = false;
  }
};

const startComposingMentor = async (rowFromExcel) => {
  const addErrorRow = (errorMessage) => {
    importResults.value.push({
      nuit: rowFromExcel.NUIT,
      name: rowFromExcel.Nome + ' ' + rowFromExcel.Apelido,
      erro: errorMessage,
    });
  };

  const district = districtService.getDistrictByDescription(
    rowFromExcel.Distrito
  );
  let province = null;
  let healthFacility = null;
  let location = null;
  let partner = null;
  let professionalCategory = null;
  let employee = null;
  let programmaticArea = null;
  let tutorProgrammaticArea = null;
  let mentor = null;
  if (district) {
    province = provinceService.getById(district.province_id);
    if (province) {
      healthFacility = healthFacilityService.getByHealthFacility(
        rowFromExcel.US
      );
      if (healthFacility) {
        // NEW LOCATION
        location = new Location({
          id: null,
          uuid: uuidv4(),
          district_id: district.id,
          district: district,
          province_id: province.id,
          province: province,
          healthFacility_id: healthFacility.id,
          healthFacility: healthFacility,
          isInternal: true,
        });
        // Pegar Parceiro (Devera sempre ter um)
        console.log(rowFromExcel.Nome_da_Instituicao);
        if (!rowFromExcel.Nome_da_Instituicao) {
          partner = partnerService.getByName('MISAU');
        } else {
          partner = partnerService.getByName(rowFromExcel.Nome_da_Instituicao);
        }

        if (partner) {
          // Pegar Categoria Profissional (ira existir sempre)
          console.log(rowFromExcel.Categoria_Profissional);
          professionalCategory = await professionalCategoryService.getByCode(
            rowFromExcel.Categoria_Profissional
          );
          console.log(professionalCategory);

          if (professionalCategory) {
            // criar employee
            employee = new Employee({
              id: null,
              uuid: null,
              name: rowFromExcel.Nome,
              surname: rowFromExcel.Apelido,
              nuit: rowFromExcel.NUIT,
              trainingYear: rowFromExcel.Ano_de_Formacao,
              phoneNumber: rowFromExcel.Numero_de_Telefone,
              email: rowFromExcel.Email,
              category_id: professionalCategory.id,
              partner_id: partner.id,
              professionalCategory: professionalCategory,
              partner: partner,
              locations: [location],
            });
            // Pegar Area Programatica
            // programmaticArea = programmaticAreaService.getByName(rowFromExcel.Area_de_Mentoria)

            // if(programmaticArea) {
            // Criar TutorProgramaticArea
            // tutorProgrammaticArea = new TutorProgrammaticArea({
            //   id: null,
            //   uuid: uuidv4(),
            //   mentor_id: null,
            //   programmatic_area_id: programmaticArea.id,
            //   lifeCycleStatus: null,
            //
            //   //relationships
            //   mentor: null,
            //   programmaticArea: programmaticArea
            // })
            // Criar mentor e mandar post
            mentor = new Mentor({
              id: null,
              uuid: null,
              perfil: rowFromExcel.Perfil_de_Acesso,
              nivel_de_acesso: rowFromExcel.Nivel_de_Acesso,
              employee_id: employee.id,
              employee: employee,
              tutorProgrammaticAreas: [],
            });
            //
            const mentorDTO = createDTOFromMentor(mentor);
            // Salvar
            useLoading().showloading();
            mentorService.save(mentorDTO).then((resp) => {
              if (resp.status !== 201) {
                totalNotImported.value += 1;
                addErrorRow(resp.response.data.message);
              } else {
                totalImported.value += 1;
              }
              alertInfo('Importação Terminada.');
            });
            useLoading().closeLoading();
            // } else {
            //   // Nao existe essa Area programatica
            //   totalNotImported.value += 1
            //   addErrorRow('Area programatica não encontrada')
            // }
          } else {
            // Categoria Profissional Nao Existe
            totalNotImported.value += 1;
            addErrorRow('Categoria Profissional não encontrada');
          }
        } else {
          // esse parceiro nao existe
          totalNotImported.value += 1;
          addErrorRow('Parceiro não encontrado');
        }
      } else {
        // HealthFacility nao encontrada
        totalNotImported.value += 1;
        addErrorRow('HealthFacility não encontrado');
      }
    } else {
      // Provincia nao encontrada
      totalNotImported.value += 1;
      addErrorRow('Provincia não encontrada');
    }
  } else {
    // Distrito nao encontrado
    totalNotImported.value += 1;
    addErrorRow('Distrito não encontrado');
  }
};

const close = () => {
  emit('close');
};

const excelExport = (event) => {
  let input = event;
  let reader = new FileReader();
  reader.onload = () => {
    let fileData = reader.result;
    selectedFile.value = XLSX.read(fileData, { type: 'binary' });
    sheets.value = selectedFile.value.SheetNames;
  };
  reader.readAsBinaryString(input);
};
</script>
