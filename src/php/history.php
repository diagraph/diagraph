<?php
	include("global.php");
	
	function display_history() {
		//
		$history_html = file_get_contents("html/snapshot_history.html");
		$history_item_html = file_get_contents("html/snapshot_history_item.html");
		
		// TODO: get snapshot history data from db
		// for now: dummy data
		$history_content = "";
		for($i = 0; $i < 3; $i++) {
			$item_num = $i+1;
			
			date_default_timezone_set('UTC');
			$item_date = date("Y/m/d h:i A", time()-$i*1000000-rand(0,1000000));
			
			$item_data = str_replace("{VO_SNAPSHOT_HISTORY_ITEM_ID}", $i, $history_item_html);
			$item_data = str_replace("{VO_SNAPSHOT_HISTORY_ITEM_NUMBER}", $item_num, $item_data);
			$item_data = str_replace("{VO_SNAPSHOT_HISTORY_ITEM_DATE}", $item_date, $item_data);
			$item_data = str_replace("{VO_SNAPSHOT_HISTORY_ITEM_PREVIEW}", "images/dummy/doc_preview_".$i.".png", $item_data);
			
			$history_content .= $item_data;
		}
		
		//
		$history_data = str_replace("{VO_SNAPSHOT_HISTORY_CONTENT}", $history_content, $history_html);
		echo $history_data;
	}
	
?>
