import { Component, OnInit } from '@angular/core';
import { TableSocket } from '../tables-socket.service';
import {Table} from '../table'
import {TablesLogicService} from '../tables-logic.service'
import {TableChange} from '../tableChange';
import { takeLast } from 'rxjs/operators';
import { TableChangeOperation } from '../tableChangeOperation';


@Component({
  selector: 'app-main-tables',
  templateUrl: './main-tables.component.html',
  styleUrls: ['./main-tables.component.css'],
  
})
export class MainTablesComponent implements OnInit {

  constructor(private sockets : TableSocket,private tablesLogic: TablesLogicService) {
  }
  chairsNum: number = 8;
  lastTable: number = 0 ;
  jsonTable: TableChange;
  eventPopularity : number

  onSelect(table: Table) : void {
    if(this.tablesLogic.isAllowSelect){
        this.tablesLogic.selectedTable = table.id;
        this.jsonTable = { lastTable: this.lastTable , newTable: table.id};
        this.lastTable = table.id;
    
        this.sockets.tableSelected(this.jsonTable);
    
  }
}
  getMockTables() : void {
    this.tablesLogic.tables = this.tablesLogic.getTables();
    
  }
  isTaken(table : Table) : Boolean{
    if(table.status === 2)
      return true
    else
      return false
    
  }

  checkIfContains(tableId: number) : boolean {

    return (this.tablesLogic.selectedByOther.indexOf(tableId) != -1);
  }

  ngOnInit() {
  //  this.getTables();
    
     //get changes from users trying to choose table
     this.sockets
     .tableChanged()
     .subscribe(msg => { 
       //change table selected by other
       let lastIndex = this.tablesLogic.selectedByOther.indexOf(msg.lastTable) ;
       if(lastIndex  !== -1){ // Not contains msg number
         this.tablesLogic.selectedByOther.splice(lastIndex,1);   
       }
       this.tablesLogic.selectedByOther.push(msg.newTable);
     })
  
  
    //get all changes when connecting
    this.sockets
    .allTables()
    .subscribe(tables => {

    //change table selected by other  
    this.tablesLogic.tables = tables;
  
    });

    //get all changes of tables anytime 
    this.sockets.
    allTablesBroadcast().
    subscribe(tables => {
      this.tablesLogic.tables = tables
     
    })

    //retrieving temporary data of tables when connecting
    this.sockets.
    allTablesTemp().
    subscribe(selectedByOther => {
      
      console.log("got temp data from server" + selectedByOther)
      this.tablesLogic.selectedByOther = selectedByOther
      console.log("selectedByOther table is " + this.tablesLogic.selectedByOther)
     
    });


    this.sockets.eventPopularity().
    subscribe(eventPopularity => { this.eventPopularity = eventPopularity 
    console.log("Event popularity is: " + this.eventPopularity)})
    //clean selected by other list when change event(room)
    /*
    this.sockets.
    userChangedRoom().
    subscribe( data => {
      console.log("cleaned selected by other")
      this.tablesLogic.selectedByOther = []
    })
    */

    
    };

  }

    

   

  




