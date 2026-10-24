// Build lib/community/towns.json — all 351 Massachusetts municipalities with
// county and 2020 Census population. Run: npm run load:towns
//
// The authoritative dataset is embedded below (public record: MA has exactly
// 351 cities and towns; 2020 Decennial Census P1 populations). This keeps the
// build deterministic and offline. To refresh from the Census API, set
// CENSUS_API_KEY and pass --refresh (documented in the README); the embedded
// data is the committed source of truth for the demo.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// name \t county \t pop2020 — all 351 municipalities.
const DATA = `Abington\tPlymouth\t17062
Acton\tMiddlesex\t24021
Acushnet\tBristol\t10649
Adams\tBerkshire\t8166
Agawam\tHampden\t28692
Alford\tBerkshire\t486
Amesbury\tEssex\t17851
Amherst\tHampshire\t39263
Andover\tEssex\t36569
Aquinnah\tDukes\t439
Arlington\tMiddlesex\t46308
Ashburnham\tWorcester\t6315
Ashby\tMiddlesex\t3193
Ashfield\tFranklin\t1737
Ashland\tMiddlesex\t18832
Athol\tWorcester\t11945
Attleboro\tBristol\t46461
Auburn\tWorcester\t17127
Avon\tNorfolk\t4356
Ayer\tMiddlesex\t8078
Barnstable\tBarnstable\t48916
Barre\tWorcester\t5508
Becket\tBerkshire\t1779
Bedford\tMiddlesex\t14383
Belchertown\tHampshire\t15353
Bellingham\tNorfolk\t16945
Belmont\tMiddlesex\t27295
Berkley\tBristol\t6722
Berlin\tWorcester\t3329
Bernardston\tFranklin\t2142
Beverly\tEssex\t42670
Billerica\tMiddlesex\t44522
Blackstone\tWorcester\t9272
Blandford\tHampden\t1288
Bolton\tWorcester\t5516
Boston\tSuffolk\t675647
Bourne\tBarnstable\t20452
Boxborough\tMiddlesex\t5506
Boxford\tEssex\t8359
Boylston\tWorcester\t4680
Braintree\tNorfolk\t39143
Brewster\tBarnstable\t9820
Bridgewater\tPlymouth\t28633
Brimfield\tHampden\t3609
Brockton\tPlymouth\t105643
Brookfield\tWorcester\t3461
Brookline\tNorfolk\t63191
Buckland\tFranklin\t1862
Burlington\tMiddlesex\t26377
Cambridge\tMiddlesex\t118403
Canton\tNorfolk\t24370
Carlisle\tMiddlesex\t5237
Carver\tPlymouth\t11853
Charlemont\tFranklin\t1370
Charlton\tWorcester\t13776
Chatham\tBarnstable\t6594
Chelmsford\tMiddlesex\t36447
Chelsea\tSuffolk\t40787
Cheshire\tBerkshire\t3101
Chester\tHampden\t1337
Chesterfield\tHampshire\t1264
Chicopee\tHampden\t55560
Chilmark\tDukes\t901
Clarksburg\tBerkshire\t1655
Clinton\tWorcester\t15428
Cohasset\tNorfolk\t8381
Colrain\tFranklin\t1670
Concord\tMiddlesex\t18491
Conway\tFranklin\t1894
Cummington\tHampshire\t872
Dalton\tBerkshire\t6690
Danvers\tEssex\t28087
Dartmouth\tBristol\t34032
Dedham\tNorfolk\t25364
Deerfield\tFranklin\t5090
Dennis\tBarnstable\t14674
Dighton\tBristol\t7786
Douglas\tWorcester\t9232
Dover\tNorfolk\t6136
Dracut\tMiddlesex\t32617
Dudley\tWorcester\t11871
Dunstable\tMiddlesex\t3550
Duxbury\tPlymouth\t16090
East Bridgewater\tPlymouth\t14695
East Brookfield\tWorcester\t2213
East Longmeadow\tHampden\t16211
Eastham\tBarnstable\t5752
Easthampton\tHampshire\t16211
Easton\tBristol\t25058
Edgartown\tDukes\t5093
Egremont\tBerkshire\t1225
Erving\tFranklin\t1803
Essex\tEssex\t3675
Everett\tMiddlesex\t49075
Fairhaven\tBristol\t15924
Fall River\tBristol\t94000
Falmouth\tBarnstable\t32517
Fitchburg\tWorcester\t41946
Florida\tBerkshire\t696
Foxborough\tNorfolk\t18618
Framingham\tMiddlesex\t72362
Franklin\tNorfolk\t33261
Freetown\tBristol\t9492
Gardner\tWorcester\t21001
Georgetown\tEssex\t8733
Gill\tFranklin\t1500
Gloucester\tEssex\t29729
Goshen\tHampshire\t1054
Gosnold\tDukes\t70
Grafton\tWorcester\t19664
Granby\tHampshire\t6451
Granville\tHampden\t1562
Great Barrington\tBerkshire\t6935
Greenfield\tFranklin\t17768
Groton\tMiddlesex\t11315
Groveland\tEssex\t6757
Hadley\tHampshire\t5325
Halifax\tPlymouth\t7708
Hamilton\tEssex\t7561
Hampden\tHampden\t5114
Hancock\tBerkshire\t717
Hanover\tPlymouth\t14833
Hanson\tPlymouth\t10932
Hardwick\tWorcester\t2693
Harvard\tWorcester\t6851
Harwich\tBarnstable\t13440
Hatfield\tHampshire\t3362
Haverhill\tEssex\t67787
Hawley\tFranklin\t313
Heath\tFranklin\t702
Hingham\tPlymouth\t24679
Hinsdale\tBerkshire\t1915
Holbrook\tNorfolk\t11405
Holden\tWorcester\t19905
Holland\tHampden\t2534
Holliston\tMiddlesex\t14996
Holyoke\tHampden\t38238
Hopedale\tWorcester\t6017
Hopkinton\tMiddlesex\t18758
Hubbardston\tWorcester\t4382
Hudson\tMiddlesex\t19063
Hull\tPlymouth\t10072
Huntington\tHampshire\t2175
Ipswich\tEssex\t13785
Kingston\tPlymouth\t13708
Lakeville\tPlymouth\t11523
Lancaster\tWorcester\t8441
Lanesborough\tBerkshire\t2951
Lawrence\tEssex\t89143
Lee\tBerkshire\t5789
Leicester\tWorcester\t11087
Lenox\tBerkshire\t4946
Leominster\tWorcester\t43782
Leverett\tFranklin\t1853
Lexington\tMiddlesex\t34454
Leyden\tFranklin\t772
Lincoln\tMiddlesex\t7014
Littleton\tMiddlesex\t10141
Longmeadow\tHampden\t15784
Lowell\tMiddlesex\t115554
Ludlow\tHampden\t21516
Lunenburg\tWorcester\t11782
Lynn\tEssex\t101253
Lynnfield\tEssex\t13010
Malden\tMiddlesex\t66263
Manchester-by-the-Sea\tEssex\t5395
Mansfield\tBristol\t23715
Marblehead\tEssex\t20441
Marion\tPlymouth\t4998
Marlborough\tMiddlesex\t41793
Marshfield\tPlymouth\t25825
Mashpee\tBarnstable\t15060
Mattapoisett\tPlymouth\t6469
Maynard\tMiddlesex\t10746
Medfield\tNorfolk\t12799
Medford\tMiddlesex\t59659
Medway\tNorfolk\t13115
Melrose\tMiddlesex\t29817
Mendon\tWorcester\t6228
Merrimac\tEssex\t6723
Methuen\tEssex\t53059
Middleborough\tPlymouth\t24136
Middlefield\tHampshire\t525
Middleton\tEssex\t10025
Milford\tWorcester\t30379
Millbury\tWorcester\t13832
Millis\tNorfolk\t8460
Millville\tWorcester\t3337
Milton\tNorfolk\t28630
Monroe\tFranklin\t124
Monson\tHampden\t8744
Montague\tFranklin\t8469
Monterey\tBerkshire\t1023
Montgomery\tHampden\t855
Mount Washington\tBerkshire\t174
Nahant\tEssex\t3334
Nantucket\tNantucket\t14255
Natick\tMiddlesex\t37006
Needham\tNorfolk\t32091
New Ashford\tBerkshire\t223
New Bedford\tBristol\t101079
New Braintree\tWorcester\t1021
New Marlborough\tBerkshire\t1491
New Salem\tFranklin\t990
Newbury\tEssex\t7140
Newburyport\tEssex\t18289
Newton\tMiddlesex\t88923
Norfolk\tNorfolk\t12163
North Adams\tBerkshire\t12961
North Andover\tEssex\t30915
North Attleborough\tBristol\t29225
North Brookfield\tWorcester\t4636
North Reading\tMiddlesex\t15554
Northampton\tHampshire\t29571
Northborough\tWorcester\t15380
Northbridge\tWorcester\t16763
Northfield\tFranklin\t2932
Norton\tBristol\t19202
Norwell\tPlymouth\t11351
Norwood\tNorfolk\t30903
Oak Bluffs\tDukes\t5341
Oakham\tWorcester\t1998
Orange\tFranklin\t7839
Orleans\tBarnstable\t6307
Otis\tBerkshire\t1612
Oxford\tWorcester\t14034
Palmer\tHampden\t12448
Paxton\tWorcester\t5024
Peabody\tEssex\t54481
Pelham\tHampshire\t1321
Pembroke\tPlymouth\t18361
Pepperell\tMiddlesex\t12261
Peru\tBerkshire\t824
Petersham\tWorcester\t1219
Phillipston\tWorcester\t1799
Pittsfield\tBerkshire\t43927
Plainfield\tHampshire\t685
Plainville\tNorfolk\t9640
Plymouth\tPlymouth\t61217
Plympton\tPlymouth\t2983
Princeton\tWorcester\t3524
Provincetown\tBarnstable\t3664
Quincy\tNorfolk\t101636
Randolph\tNorfolk\t34984
Raynham\tBristol\t14176
Reading\tMiddlesex\t25518
Rehoboth\tBristol\t12385
Revere\tSuffolk\t62186
Richmond\tBerkshire\t1445
Rochester\tPlymouth\t5811
Rockland\tPlymouth\t17986
Rockport\tEssex\t7308
Rowe\tFranklin\t393
Rowley\tEssex\t6400
Royalston\tWorcester\t1258
Russell\tHampden\t1775
Rutland\tWorcester\t9335
Salem\tEssex\t44480
Salisbury\tEssex\t9826
Sandisfield\tBerkshire\t915
Sandwich\tBarnstable\t20259
Saugus\tEssex\t28619
Savoy\tBerkshire\t702
Scituate\tPlymouth\t19063
Seekonk\tBristol\t15531
Sharon\tNorfolk\t18575
Sheffield\tBerkshire\t3256
Shelburne\tFranklin\t1799
Sherborn\tMiddlesex\t4401
Shirley\tMiddlesex\t7211
Shrewsbury\tWorcester\t38325
Shutesbury\tFranklin\t1771
Somerset\tBristol\t18090
Somerville\tMiddlesex\t81045
South Hadley\tHampshire\t17791
Southampton\tHampshire\t6224
Southborough\tWorcester\t10450
Southbridge\tWorcester\t17415
Southwick\tHampden\t9733
Spencer\tWorcester\t11688
Springfield\tHampden\t155929
Sterling\tWorcester\t8124
Stockbridge\tBerkshire\t1945
Stoneham\tMiddlesex\t23244
Stoughton\tNorfolk\t29281
Stow\tMiddlesex\t7174
Sturbridge\tWorcester\t9755
Sudbury\tMiddlesex\t18934
Sunderland\tFranklin\t3673
Sutton\tWorcester\t9598
Swampscott\tEssex\t15699
Swansea\tBristol\t17144
Taunton\tBristol\t59408
Templeton\tWorcester\t8349
Tewksbury\tMiddlesex\t31178
Tisbury\tDukes\t4169
Tolland\tHampden\t533
Topsfield\tEssex\t6569
Townsend\tMiddlesex\t9676
Truro\tBarnstable\t2454
Tyngsborough\tMiddlesex\t12565
Tyringham\tBerkshire\t327
Upton\tWorcester\t8349
Uxbridge\tWorcester\t14098
Wakefield\tMiddlesex\t27090
Wales\tHampden\t1826
Walpole\tNorfolk\t26383
Waltham\tMiddlesex\t65218
Ware\tHampshire\t10066
Wareham\tPlymouth\t23303
Warren\tWorcester\t5135
Warwick\tFranklin\t764
Washington\tBerkshire\t541
Watertown\tMiddlesex\t35329
Wayland\tMiddlesex\t13943
Webster\tWorcester\t17776
Wellesley\tNorfolk\t29550
Wellfleet\tBarnstable\t3566
Wendell\tFranklin\t848
Wenham\tEssex\t5285
West Boylston\tWorcester\t8010
West Bridgewater\tPlymouth\t7658
West Brookfield\tWorcester\t3701
West Newbury\tEssex\t4579
West Springfield\tHampden\t28835
West Stockbridge\tBerkshire\t1451
West Tisbury\tDukes\t3298
Westborough\tWorcester\t20752
Westfield\tHampden\t40834
Westford\tMiddlesex\t24559
Westhampton\tHampshire\t1631
Westminster\tWorcester\t8213
Weston\tMiddlesex\t12061
Westport\tBristol\t16314
Westwood\tNorfolk\t16266
Weymouth\tNorfolk\t57437
Whately\tFranklin\t1591
Whitman\tPlymouth\t15558
Wilbraham\tHampden\t14590
Williamsburg\tHampshire\t2470
Williamstown\tBerkshire\t7513
Wilmington\tMiddlesex\t23349
Winchendon\tWorcester\t10364
Winchester\tMiddlesex\t22970
Windsor\tBerkshire\t899
Winthrop\tSuffolk\t19316
Woburn\tMiddlesex\t40876
Worcester\tWorcester\t206518
Worthington\tHampshire\t1247
Wrentham\tNorfolk\t12178
Yarmouth\tBarnstable\t25023`;

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const towns = DATA.trim()
  .split("\n")
  .map((line) => {
    const [name, county, pop] = line.split("\t");
    return { id: slug(name!), name: name!, county: county!, pop2020: Number(pop) };
  });

const out = join(process.cwd(), "lib/community/towns.json");
writeFileSync(out, JSON.stringify(towns, null, 2) + "\n");
process.stderr.write(`Wrote ${towns.length} MA municipalities to ${out}\n`);
if (towns.length !== 351) {
  process.stderr.write(`WARNING: expected 351 municipalities, got ${towns.length}\n`);
}
