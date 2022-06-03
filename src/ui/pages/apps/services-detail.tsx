import { AppState, DeployApp } from '@app/types';
import { calcServiceMetrics, selectServiceById } from '@app/deploy';

import { TableHead, Td, ResourceListView, Button, tokens } from '../../shared';
import { useSelector } from 'react-redux';

const ServiceListRow = ({ serviceId }: { serviceId: string }) => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const metrics = calcServiceMetrics(service);

  return (
    <tr>
      <Td className="flex-1">
        <div className={tokens.type.darker}>{service.handle}</div>
        <div className={tokens.type['normal lighter']}>
          {service.processType}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>
          {service.containerCount} &times; {metrics.containerSizeGB} GB
          Container(s)
        </div>
        <div className={tokens.type['normal lighter']}>
          {metrics.containerProfile.name}
        </div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>Endpoints</div>
        <div className={tokens.type['normal lighter']}>todo</div>
      </Td>

      <Td className="flex-1">
        <div className={tokens.type.darker}>
          {metrics.estimatedCostInDollars}
        </div>
        <div className={tokens.type['normal lighter']}>per month</div>
      </Td>

      <Td className="flex gap-2 justify-end w-40">
        <Button type="submit" variant="white" size="xs">
          Metrics
        </Button>
        <Button type="submit" variant="white" size="xs">
          Scale
        </Button>
      </Td>
    </tr>
  );
};

export function ServicesOverview({ app }: { app: DeployApp }) {
  return (
    <ResourceListView
      title="Services"
      description="Services are metadata that defines how many Containers
      Aptible will start for your App, what Container Command they will run, their Memory Limits, and their CPU Limits."
      actions={[<Button>Create Service</Button>]}
      tableHeader={
        <TableHead
          headers={[
            'Service',
            'Scale',
            'Endpoints',
            'Monthly Cost',
            { name: '', className: 'w-40' },
          ]}
        />
      }
      tableBody={
        <>
          {app.serviceIds.map((serviceId) => (
            <ServiceListRow serviceId={serviceId} key={serviceId} />
          ))}
        </>
      }
    />
  );
}
